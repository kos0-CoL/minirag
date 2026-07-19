import { describe, it, expect } from 'vitest';
import { buildContextForQuestion } from '@/utils/contextBuilder';

describe('buildContextForQuestion', () => {
  it('uses only the selected document when a manual selection exists', () => {
    const searchResults = [
      { chunk: { contenido: 'contenido del txt' }, documento: { nombre: 'archivo.txt' } },
    ];

    const selectedDocs = new Set(['doc-pdf']);
    const documents = [
      { id: 'doc-pdf', nombre: 'archivo.pdf', chunks: [{ contenido: 'contenido del pdf' }] },
      { id: 'doc-txt', nombre: 'archivo.txt', chunks: [{ contenido: 'contenido del txt' }] },
    ];

    const result = buildContextForQuestion(searchResults, selectedDocs, documents as any);

    expect(result.context).toContain('contenido del pdf');
    expect(result.context).not.toContain('contenido del txt');
    expect(result.docsUsados).toEqual(['archivo.pdf']);
  });
});
