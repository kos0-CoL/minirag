import { describe, it, expect } from 'vitest';
import { toggleDocumentSelection } from '@/utils/documentSelection';

describe('toggleDocumentSelection', () => {
  it('replaces the current selection with the newly clicked document', () => {
    const previous = new Set(['doc-a']);
    const next = toggleDocumentSelection(previous, 'doc-b');

    expect(next.size).toBe(1);
    expect(next.has('doc-b')).toBe(true);
    expect(next.has('doc-a')).toBe(false);
  });

  it('clears the selection when the same document is clicked again', () => {
    const previous = new Set(['doc-b']);
    const next = toggleDocumentSelection(previous, 'doc-b');

    expect(next.size).toBe(0);
    expect(next.has('doc-b')).toBe(false);
  });
});
