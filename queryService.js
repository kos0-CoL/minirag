import crypto from 'crypto';
import axios from 'axios';
import { getRepository } from 'typeorm';
import DocumentChunk from './src/entities/DocumentChunk.js';

class QueryService {
  async procesarQuery(query, chat, usuarioId, options) {
    const inicio = Date.now();
    const {
      agente = 'general',
      modelo = 'gemini-pro',
      k = 3,
      modo = 'default',
      apiKey,
      contexto: contextoProporcionado = null,
      modoRespuesta = 'detailed',
      historial = [],
      followUp = false,
      instrucciones = null,
      embeddingAlternativo = false
    } = options;

    try {
      let contexto, docsUsados = [];

      if (contextoProporcionado) {
        contexto = `Contexto proporcionado por el usuario:\n${contextoProporcionado}`;
        docsUsados = [];
      } else if (chat) {
        const chunks = await this.retrieval(query, chat, k, { modelo, apiKey, embeddingAlternativo });
        docsUsados = chunks.map(c => c.documentoId);
        contexto = this.construirContexto(chunks, query);
      } else {
        contexto = '';
      }

      // Rejection: sin contexto relevante
      if (!contextoProporcionado && (!docsUsados.length || docsUsados.every(d => !d))) {
        return {
          respuesta: '<p>No puedo contestarte con la información proporcionada.</p>',
          documentosUtilizados: [],
          tiempoMs: Date.now() - inicio,
          rechazado: true
        };
      }

      const prompt = this.generarPrompt(query, contexto, agente, modo, historial, followUp, modoRespuesta, instrucciones);
      const temp = modoRespuesta === 'quick' ? 0.3 : 0.7;
      const maxTokens = modoRespuesta === 'quick' ? 1024 : 2048;
      const respuestaRaw = await this.llamarGemini(prompt, apiKey, modelo, temp, maxTokens);
      const respuestaFormateada = this.formatearRespuesta(respuestaRaw);

      return {
        respuesta: respuestaFormateada,
        documentosUtilizados: docsUsados,
        tiempoMs: Date.now() - inicio,
        rechazado: false
      };
    } catch (error) {
      console.error('Error en RAG query:', error);
      throw error;
    }
  }

  async retrieval(query, chat, k, options = {}) {
    const chunkRepo = getRepository(DocumentChunk);
    const queryEmbedding = await this.obtenerEmbedding(query, options);

    const chunks = await chunkRepo
      .createQueryBuilder('chunk')
      .where('chunk.documentoId IN (:...docIds)', { docIds: chat.documentosIds || [] })
      .orderBy('chunk.indice', 'ASC')
      .take(k * 2)
      .getMany();

    if (queryEmbedding && chunks.length > 0 && chunks[0].embedding) {
      chunks.forEach(chunk => {
        chunk.score = this.similitudCoseno(queryEmbedding, chunk.embedding);
      });
      chunks.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return chunks.slice(0, k);
  }

  async obtenerEmbedding(texto, options = {}) {
    const { modelo = 'gemini-pro', apiKey, embeddingAlternativo = false } = options;

    // Si el usuario eligió embeddings alternativos (Hugging Face)
    if (embeddingAlternativo) {
      return this.obtenerEmbeddingHuggingFace(texto);
    }

    // Detectar proveedor del modelo seleccionado
    const proveedor = this.detectarProveedor(modelo);

    try {
      if (proveedor === 'MISTRAL') {
        return await this.obtenerEmbeddingMistral(texto, apiKey);
      }
      // Default: Gemini (funciona para Gemini, y fallback para otros)
      return await this.obtenerEmbeddingGemini(texto, apiKey);
    } catch (error) {
      console.error(`Error obteniendo embedding con ${proveedor}:`, error.message);
      // Fallback a Hugging Face si el proveedor principal falla
      console.log('Fallback a embeddings de Hugging Face...');
      return this.obtenerEmbeddingHuggingFace(texto);
    }
  }

  detectarProveedor(modelo) {
    if (!modelo) return 'GEMINI';
    const modeloLower = modelo.toLowerCase();
    if (modeloLower.includes('mistral')) return 'MISTRAL';
    if (modeloLower.includes('gpt') || modeloLower.includes('openai')) return 'OPENAI';
    if (modeloLower.includes('claude') || modeloLower.includes('anthropic')) return 'ANTHROPIC';
    if (modeloLower.includes('command') || modeloLower.includes('cohere')) return 'COHERE';
    return 'GEMINI';
  }

  async obtenerEmbeddingGemini(texto, apiKey) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) throw new Error('No hay API key de Gemini disponible');

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent',
      { content: { parts: [{ text: texto }] } },
      { params: { key }, headers: { 'Content-Type': 'application/json' } }
    );
    return response.data.embedding.values;
  }

  async obtenerEmbeddingMistral(texto, apiKey) {
    if (!apiKey) throw new Error('No hay API key de Mistral disponible');

    const response = await axios.post(
      'https://api.mistral.ai/v1/embeddings',
      {
        model: 'mistral-embed',
        input: texto
      },
      { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
    );
    return response.data.data[0].embedding;
  }

  async obtenerEmbeddingHuggingFace(texto) {
    try {
      // Hugging Face Inference API - modelo gratuito all-MiniLM-L6-v2
      const response = await axios.post(
        'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
        { inputs: texto },
        { headers: { 'Content-Type': 'application/json' } }
      );
      // El modelo retorna un array de arrays, tomamos el primero
      return Array.isArray(response.data[0]) ? response.data[0] : response.data;
    } catch (error) {
      console.error('Error con Hugging Face:', error.message);
      return null;
    }
  }

  similitudCoseno(vec1, vec2) {
    if (!vec1 || !vec2) return 0;
    const dotProduct = vec1.reduce((sum, a, i) => sum + a * vec2[i], 0);
    const magnitud1 = Math.sqrt(vec1.reduce((sum, a) => sum + a * a, 0));
    const magnitud2 = Math.sqrt(vec2.reduce((sum, a) => sum + a * a, 0));
    return (dotProduct / (magnitud1 * magnitud2)) || 0;
  }

  construirContexto(chunks, query) {
    if (!chunks || chunks.length === 0) return '';
    return chunks
      .map((c, i) => `[${i + 1}] ${c.contenido}\n(Fuente: ${c.documento?.nombre || 'desconocida'})`)
      .join('\n\n---\n\n');
  }

  generarPrompt(query, contexto, agente, modo, historial = [], followUp = false, modoRespuesta = 'detailed', instrucciones = null) {
    const instruccionesModo = {
      default: 'Proporciona una respuesta clara y concisa.',
      research: 'Analiza profundamente y proporciona múltiples perspectivas con referencias.',
      creative: 'Usa un tono creativo e innovador en la respuesta.',
      technical: 'Sé preciso y técnico. Incluye detalles de implementación si es relevante.'
    };

    const instruccion = instrucciones || instruccionesModo[modo] || instruccionesModo.default;
    const tono = modoRespuesta === 'quick' ? 'Responde breve y directo, máximo 3 párrafos.' : 'Puedes extenderte con detalles si es necesario.';

    let historialStr = '';
    if (followUp && historial.length > 0) {
      historialStr = `\n\nHISTORIAL RECIENTE DE LA CONVERSACIÓN:\n${historial.join('\n')}\n`;
    }

    let contextoStr = contexto || 'No hay documentos disponibles.';
    const noDocs = !contexto || contexto.length < 10;

    const rejectionRule = noDocs
      ? 'REGLA ESTRICTA: Si no tienes información en el CONTEXTO que responda EXACTAMENTE la pregunta, responde ÚNICAMENTE: "No puedo contestarte con la información proporcionada." NO inventes nada.'
      : '- Si la pregunta no se relaciona con el CONTEXTO proporcionado, responde: "No puedo contestarte con la información proporcionada."';

    return `
Eres un asistente de IA especializado. Tu nombre es "${agente}".

CONTEXTO:
${contextoStr}
${historialStr}

INSTRUCCIONES:
- ${instruccion}
- ${tono}
- Cita las fuentes entre paréntesis cuando uses información de los documentos.
- ${rejectionRule}

PREGUNTA DEL USUARIO:
${query}

RESPUESTA:
`;
  }

  async llamarGemini(prompt, apiKey, modelo, temperature = 0.7, maxTokens = 2048) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, topP: 0.9, topK: 40, maxOutputTokens: maxTokens }
        },
        { params: { key: apiKey }, headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;
      if (!data || !Array.isArray(data.candidates) || data.candidates.length === 0) {
        console.error('Gemini response missing candidates:', JSON.stringify(data, null, 2));
        throw new Error('Gemini response did not include candidates');
      }

      const candidate = data.candidates[0];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text) {
        console.error('Gemini candidate shape unexpected:', JSON.stringify(candidate, null, 2));
        throw new Error('Gemini response candidate is missing expected text');
      }

      return text;
    } catch (error) {
      const responseData = error.response?.data;
      console.error('Error Gemini:', responseData || error.message);
      if (responseData) {
        console.error('Gemini raw error response:', JSON.stringify(responseData, null, 2));
      }
      throw new Error(`Error calling Gemini API: ${error.message}`);
    }
  }

  formatearRespuesta(texto) {
    if (!texto) return '';
    let html = texto
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
    return html;
  }

  hashQuery(query, agente, modelo) {
    const key = `${query}::${agente}::${modelo}`;
    return crypto.createHash('sha256').update(key).digest('hex');
  }
}

export const queryService = new QueryService();
