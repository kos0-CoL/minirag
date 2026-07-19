/// <reference types="vite/client" />

export interface ChunkMetadata {
  autor: string;
  fecha: string;
  tema: string;
}

export interface DocumentIndex {
  id: string;
  nombre: string;
  tipo: string;
  tamanio: number;
  metadatos: ChunkMetadata;
  contenido: string;
  chunks: Chunk[];
  createdAt: string;
}

export interface Chunk {
  id: string;
  indice: number;
  contenido: string;
  inicio: number;
  fin: number;
  documentoId: string;
}

const CHUNK_SIZE_KEY = 'minirag_chunk_size';
const DOCUMENTS_KEY = 'minirag_documents';
const HASH_CACHE_KEY = 'minirag_chunk_hashes';

function fileHash(content: string): string {
  let h = 0;
  for (let i = 0; i < content.length && i < 5000; i++) {
    h = ((h << 5) - h) + content.charCodeAt(i);
    h |= 0;
  }
  return 'h' + Math.abs(h).toString(36);
}

function getHashCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(HASH_CACHE_KEY) || '{}'); }
  catch { return {}; }
}

function setHashCache(name: string, hash: string) {
  const cache = getHashCache();
  cache[name] = hash;
  localStorage.setItem(HASH_CACHE_KEY, JSON.stringify(cache));
}

export function hasDocumentChanged(fileName: string, content: string): boolean {
  return getHashCache()[fileName] !== fileHash(content);
}

export function getChunkSize(): number {
  return parseInt(localStorage.getItem(CHUNK_SIZE_KEY) || '1000');
}

export function setChunkSize(size: number) {
  localStorage.setItem(CHUNK_SIZE_KEY, String(size));
}

export function getPdfJsOptions() {
  return {
    useWorkerFetch: false,
    isEvalSupported: false,
  };
}

export function shouldAttemptOcr(extractedText: string): boolean {
  const normalized = extractedText.replace(/\s+/g, ' ').trim();
  if (!normalized) return true;
  if (normalized.length < 20) return true;
  if (/\b(fnArray|argsArray|lastChunk|separateAnnots)\b/i.test(normalized)) return true;
  return false;
}

async function getPdfWorkerUrl(): Promise<string> {
  try {
    const mod = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    return (mod as { default?: string }).default || '';
  } catch {
    return '';
  }
}

async function extractPdfWithOcr(file: File): Promise<string> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('OCR no disponible en este entorno');
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');
  const workerSrc = await getPdfWorkerUrl();
  if (workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    ...getPdfJsOptions(),
  }).promise;

  const tesseractModule = await import('tesseract.js/dist/tesseract.esm.min.js');
  const worker = await tesseractModule.createWorker('spa');
  try {
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.4 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('No se pudo crear el canvas para OCR');
      }

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
      const result = await worker.recognize(canvas);
      const pageText = (result?.data?.text || '').replace(/\s+/g, ' ').trim();
      if (pageText) {
        text += pageText + '\n';
      }
    }

    const normalized = text.replace(/\s+/g, ' ').trim();
    if (shouldAttemptOcr(normalized)) {
      throw new Error('OCR no produjo texto suficiente');
    }
    return normalized;
  } finally {
    await worker.terminate();
  }
}

export function getDocuments(): DocumentIndex[] {
  try {
    return JSON.parse(localStorage.getItem(DOCUMENTS_KEY) || '[]');
  } catch { return []; }
}

function saveDocuments(docs: DocumentIndex[]) {
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
}

export function extractText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsText(file);
    } else if (ext === 'html' || ext === 'htm') {
      const reader = new FileReader();
      reader.onload = () => {
        const html = reader.result as string;
        const text = html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        resolve(text);
      };
      reader.onerror = () => reject(new Error('Error leyendo HTML'));
      reader.readAsText(file);
    } else if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const pdfjsLib = await import('pdfjs-dist');
          const workerSrc = await getPdfWorkerUrl();
          if (workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
          }
          const pdf = await pdfjsLib.getDocument({
            data: arrayBuffer,
            ...getPdfJsOptions(),
          }).promise;

          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent({ normalizeWhitespace: true });
            const rawPageText = content.items
              .map((item: any) => (typeof item.str === 'string' ? item.str : ''))
              .filter(Boolean)
              .join(' ')
              .trim();

            const cleanedPageText = rawPageText
              .replace(/\b(fnArray|argsArray|lastChunk|separateAnnots|fnArray)\b/gi, '')
              .replace(/\{[^{}]*\}/g, '')
              .replace(/\[\d+(?:,\d+)*\]/g, '')
              .replace(/\s+/g, ' ')
              .trim();

            if (cleanedPageText && cleanedPageText.length > 3) {
              text += cleanedPageText + '\n';
            }
          }

          const normalized = text
            .replace(/\s+/g, ' ')
            .trim();

          if (shouldAttemptOcr(normalized)) {
            try {
              const ocrText = await extractPdfWithOcr(file);
              resolve(ocrText);
              return;
            } catch {
              reject(new Error('No se pudo extraer texto legible del PDF. Probá con un PDF que tenga texto real o con un archivo escaneado que pueda procesarse con OCR.'));
              return;
            }
          }
          resolve(normalized);
        } catch (e) {
          reject(new Error('Error extrayendo PDF: ' + (e as Error).message));
        }
      };
      reader.onerror = () => reject(new Error('Error leyendo PDF'));
      reader.readAsArrayBuffer(file);
    } else if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ arrayBuffer: reader.result as ArrayBuffer });
          resolve(result.value);
        } catch (e) {
          reject(new Error('Error extrayendo DOCX: ' + (e as Error).message));
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error(`Tipo de archivo no soportado: .${ext}`));
    }
  });
}

export function chunkText(texto: string, chunkSize: number, overlap: number): { texto: string; inicio: number; fin: number; palabras: number }[] {
  const chunks: { texto: string; inicio: number; fin: number; palabras: number }[] = [];
  let inicio = 0;

  while (inicio < texto.length) {
    const fin = Math.min(inicio + chunkSize, texto.length);
    let contenido = texto.substring(inicio, fin);

    if (fin < texto.length) {
      const newlineBreak = contenido.lastIndexOf('\n');
      const spaceBreak = contenido.lastIndexOf(' ');
      const breakpoint = newlineBreak > chunkSize * 0.7 ? newlineBreak : spaceBreak > chunkSize * 0.7 ? spaceBreak : -1;
      if (breakpoint > 0) {
        contenido = texto.substring(inicio, inicio + breakpoint);
        chunks.push({ texto: contenido, inicio, fin: inicio + breakpoint, palabras: contenido.split(/\s+/).length });
        inicio += breakpoint - overlap;
        continue;
      }
    }

    chunks.push({ texto: contenido, inicio, fin, palabras: contenido.split(/\s+/).length });
    inicio += chunkSize - overlap;
  }

  return chunks;
}

export async function addDocument(
  file: File,
  metadatos: ChunkMetadata
): Promise<DocumentIndex> {
  const texto = await extractText(file);
  const contentHash = fileHash(texto);
  const existing = getDocuments().find(d => d.nombre === file.name);
  if (existing && !hasDocumentChanged(file.name, texto)) {
    return existing;
  }

  const chunkSize = getChunkSize();
  const overlap = Math.floor(chunkSize * 0.2);
  const rawChunks = chunkText(texto, chunkSize, overlap);
  setHashCache(file.name, contentHash);

  const docId = crypto.randomUUID();
  const doc: DocumentIndex = {
    id: docId,
    nombre: file.name,
    tipo: file.name.split('.').pop()?.toLowerCase() || 'txt',
    tamanio: file.size,
    metadatos,
    contenido: texto,
    chunks: rawChunks.map((c, i) => ({
      id: crypto.randomUUID(),
      indice: i,
      contenido: c.texto,
      inicio: c.inicio,
      fin: c.fin,
      documentoId: docId,
    })),
    createdAt: new Date().toISOString(),
  };

  const docs = getDocuments();
  docs.push(doc);
  saveDocuments(docs);
  return doc;
}

export function removeDocument(docId: string) {
  const docs = getDocuments().filter(d => d.id !== docId);
  localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(docs));
}

export function getAllChunks(): Chunk[] {
  return getDocuments().flatMap(d => d.chunks);
}

export function exportChunksJSON(): string {
  return JSON.stringify({ documentos: getDocuments(), chunks: getAllChunks() }, null, 2);
}

export function addDocumentFromText(
  texto: string,
  nombre: string,
  metadatos: Partial<ChunkMetadata> = {}
): DocumentIndex {
  const chunkSize = getChunkSize();
  const overlap = Math.floor(chunkSize * 0.2);
  const rawChunks = chunkText(texto, chunkSize, overlap);

  const docId = crypto.randomUUID();
  const doc: DocumentIndex = {
    id: docId,
    nombre: nombre,
    tipo: 'txt',
    tamanio: texto.length,
    metadatos: { autor: metadatos.autor || 'Sistema', fecha: metadatos.fecha || new Date().toISOString().slice(0, 10), tema: metadatos.tema || 'Generado' },
    contenido: texto,
    chunks: rawChunks.map((c, i) => ({
      id: crypto.randomUUID(),
      indice: i,
      contenido: c.texto,
      inicio: c.inicio,
      fin: c.fin,
      documentoId: docId,
    })),
    createdAt: new Date().toISOString(),
  };
  const docs = getDocuments();
  docs.push(doc);
  saveDocuments(docs);
  return doc;
}

export function searchChunks(query: string, topK: number = 3): { chunk: Chunk; documento: DocumentIndex; score: number }[] {
  const docs = getDocuments();
  const results: { chunk: Chunk; documento: DocumentIndex; score: number }[] = [];

  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);

  for (const doc of docs) {
    for (const chunk of doc.chunks) {
      const chunkLower = chunk.contenido.toLowerCase();
      let score = 0;

      for (const word of queryWords) {
        const regex = new RegExp(word, 'gi');
        const matches = chunkLower.match(regex);
        if (matches) score += matches.length * 2;
      }

      if (chunkLower.includes(queryLower)) score += 20;

      if (score > 0) {
        results.push({ chunk, documento: doc, score });
      }
    }
  }

  results.sort((a, b) => b.score - a.score);

  // Fallback: if no keyword match but docs exist, return first chunks from all docs
  if (results.length === 0) {
    const docs = getDocuments();
    for (const doc of docs) {
      for (const chunk of doc.chunks.slice(0, 2)) { // top 2 chunks per doc
        results.push({ chunk, documento: doc, score: 1 });
      }
    }
  }

  return results.slice(0, topK);
}
