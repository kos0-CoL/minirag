/**
 * Document Service
 * Responsable de: extracción de texto, chunking, embedding, indexación
 */
import pdf from 'pdf-parse';
import { getRepository } from 'typeorm';
import Document from './src/entities/Document.js';
import DocumentChunk from './src/entities/DocumentChunk.js';

class DocumentService {
  /**
   * Procesar y indexar documento
   */
  async procesarDocumento(file, usuarioId, metadatos) {
    const docRepo = getRepository(Document);
    const chunkRepo = getRepository(DocumentChunk);

    try {
      // 1. Extraer texto según tipo
      const texto = await this.extraerTexto(file);

      // 2. Dividir en chunks
      const chunks = this.generarChunks(texto, {
        tamanioChunk: 1000,
        solapamiento: 200
      });

      // 3. Crear documento en BD
      const documento = docRepo.create({
        nombre: file.originalname,
        tipo: this.detectarTipo(file.originalname),
        urlAlmacenamiento: `/uploads/${usuarioId}/${file.filename}`,
        tamanio: file.size,
        usuarioId,
        metadatos,
        totalChunks: chunks.length,
        chunksIndexados: 0
      });

      await docRepo.save(documento);

      // 4. Guardar chunks en BD (sin embedding aún)
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunkRepo.create({
          documentoId: documento.id,
          indice: i,
          contenido: chunks[i].texto,
          inicio: chunks[i].inicio,
          fin: chunks[i].fin,
          metadatos: { palabras: chunks[i].palabras }
        });
        await chunkRepo.save(chunk);
      }

      // 5. Encolar tarea de embedding (job async)
      // await embedQueue.add({ documentoId: documento.id }, { priority: 1 });

      return {
        documentoId: documento.id,
        nombre: documento.nombre,
        chunks: chunks.length,
        tamanio: file.size
      };
    } catch (error) {
      console.error('Error procesando documento:', error);
      throw error;
    }
  }

  /**
   * Extraer texto de archivo
   */
  async extraerTexto(file) {
    const tipo = this.detectarTipo(file.originalname);

    switch (tipo) {
      case 'pdf':
        return await this.extraerDePDF(file);
      case 'txt':
        return file.buffer.toString('utf-8');
      case 'html':
        return await this.extraerDeHTML(file.buffer.toString('utf-8'));
      case 'md':
        return file.buffer.toString('utf-8');
      default:
        return file.buffer.toString('utf-8');
    }
  }

  /**
   * Extraer texto de PDF
   */
  async extraerDePDF(file) {
    try {
      const data = await pdf(file.buffer);
      return data.text;
    } catch (error) {
      console.error('Error extrayendo PDF:', error);
      throw new Error('No se pudo procesar el PDF');
    }
  }

  /**
   * Extraer texto de HTML
   */
  async extraerDeHTML(html) {
    // Remover scripts y styles
    let texto = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ') // Remover tags
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();

    return texto;
  }

  /**
   * Dividir texto en chunks con solapamiento
   */
  generarChunks(texto, opciones = {}) {
    const {
      tamanioChunk = 1000,
      solapamiento = 200
    } = opciones;

    const chunks = [];
    let inicio = 0;

    while (inicio < texto.length) {
      const fin = Math.min(inicio + tamanioChunk, texto.length);
      const contenido = texto.substring(inicio, fin);

      chunks.push({
        texto: contenido,
        inicio,
        fin,
        palabras: contenido.split(/\s+/).length
      });

      inicio += tamanioChunk - solapamiento;
    }

    return chunks;
  }

  /**
   * Detectar tipo de archivo
   */
  detectarTipo(nombre) {
    const ext = nombre.split('.').pop().toLowerCase();
    const tipos = {
      'pdf': 'pdf',
      'txt': 'txt',
      'html': 'html',
      'htm': 'html',
      'md': 'md',
      'docx': 'docx',
      'doc': 'doc'
    };
    return tipos[ext] || 'txt';
  }

  /**
   * Obtener documentos de un usuario
   */
  async obtenerDocumentos(usuarioId) {
    const docRepo = getRepository(Document);
    return await docRepo.find({
      where: { usuarioId },
      order: { createdAt: 'DESC' },
      relations: ['chunks']
    });
  }

  /**
   * Eliminar documento
   */
  async eliminarDocumento(documentoId, usuarioId) {
    const docRepo = getRepository(Document);
    const doc = await docRepo.findOne({ id: documentoId, usuarioId });

    if (!doc) {
      throw new Error('Documento no encontrado');
    }

    await docRepo.remove(doc);
    return { message: 'Documento eliminado' };
  }
}

export const documentService = new DocumentService();
