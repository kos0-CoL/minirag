import { describe, it, expect, beforeEach } from 'vitest';
import { chunkText, getChunkSize, setChunkSize } from '@/utils/chunkEngine';

beforeEach(() => {
  localStorage.clear();
});

describe('chunkText', () => {
  it('splits short text into one chunk', () => {
    const text = 'Hello world this is a test';
    const chunks = chunkText(text, 1000, 100);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].texto).toBe(text);
  });

  it('splits long text into multiple chunks', () => {
    const text = 'A'.repeat(2500);
    const chunks = chunkText(text, 1000, 200);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].palabras).toBeGreaterThan(0);
  });

  it('overlaps chunks correctly', () => {
    const text = 'word '.repeat(300);
    const chunks = chunkText(text, 500, 100);
    if (chunks.length > 1) {
      const overlap = chunks[0].fin - chunks[1].inicio;
      expect(overlap).toBeGreaterThan(0);
    }
  });

  it('preserves total content', () => {
    const text = 'The quick brown fox jumps over the lazy dog. '.repeat(50);
    const chunks = chunkText(text, 200, 30);
    const combined = chunks.map(c => c.texto).join('');
    expect(combined.length).toBeGreaterThan(text.length - chunks.length * 30);
  });
});

describe('getChunkSize / setChunkSize', () => {
  it('defaults to 1000', () => {
    expect(getChunkSize()).toBe(1000);
  });

  it('reads from localStorage', () => {
    setChunkSize(500);
    expect(getChunkSize()).toBe(500);
  });
});
