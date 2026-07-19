export interface SearchResultLike {
  chunk?: { contenido?: string };
  documento?: { nombre?: string };
}

export interface DocumentLike {
  id: string;
  nombre: string;
  chunks: Array<{ contenido: string }>;
}

export function buildContextForQuestion(
  searchResults: SearchResultLike[],
  selectedDocIds: Set<string>,
  allDocs: DocumentLike[]
): { context: string; docsUsados: string[] } {
  if (selectedDocIds.size > 0) {
    const selectedDocs = allDocs.filter(doc => selectedDocIds.has(doc.id));
    const selectedChunks = selectedDocs.flatMap(doc =>
      doc.chunks.map(chunk => ({ texto: chunk.contenido, docNombre: doc.nombre }))
    );

    const context = selectedChunks
      .map((c, i) => `[${i + 1}] ${c.texto}\n(Fuente: ${c.docNombre})`)
      .join('\n\n---\n\n');

    return {
      context,
      docsUsados: selectedDocs.map(doc => doc.nombre),
    };
  }

  if (searchResults.length > 0) {
    const context = searchResults
      .map((r, i) => `[${i + 1}] ${r.chunk?.contenido || ''}\n(Fuente: ${r.documento?.nombre || 'Desconocido'})`)
      .join('\n\n---\n\n');

    return {
      context,
      docsUsados: [...new Set(searchResults.map(r => r.documento?.nombre).filter(Boolean) as string[])],
    };
  }

  return { context: '', docsUsados: [] };
}
