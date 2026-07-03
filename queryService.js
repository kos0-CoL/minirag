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
      instrucciones = null
    } = options;

    try {
      let contexto, docsUsados = [];

      if (contextoProporcionado) {
        contexto = `Contexto proporcionado por el usuario:\n${contextoProporcionado}`;
        docsUsados = [];
      } else if (chat) {
        const chunks = await this.retrieval(query, chat, k);
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

  async retrieval(query, chat, k) {
    const chunkRepo = getRepository(DocumentChunk);
    const queryEmbedding = await this.obtenerEmbedding(query);

    const chunks = await chunkRepo
      .createQueryBuilder('chunk')
      .where('chunk.documentoId IN (:...docIds)', { docIds: chat.documentosIds || [] })
      .orderBy('chunk.indice', 'ASC')
      .take(k * 2)
      .getMany();

    if (chunks.length > 0 && chunks[0].embedding) {
      chunks.forEach(chunk => {
        chunk.score = this.similitudCoseno(queryEmbedding, chunk.embedding);
      });
      chunks.sort((a, b) => (b.score || 0) - (a.score || 0));
    }

    return chunks.slice(0, k);
  }

  async obtenerEmbedding(texto) {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent',
        { content: { parts: [{ text: texto }] } },
        { params: { key: process.env.GEMINI_API_KEY }, headers: { 'Content-Type': 'application/json' } }
      );
      return response.data.embedding.values;
    } catch (error) {
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
      return response.data.candidates[0]?.content?.parts[0]?.text || '';
    } catch (error) {
      console.error('Error Gemini:', error.response?.data || error.message);
      throw new Error('Error calling Gemini API');
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
