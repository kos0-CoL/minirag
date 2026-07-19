import { describe, it, expect } from 'vitest';
import { getProviderForModel } from '@/data/models';

describe('provider selection', () => {
  it('returns the provider and key for a Mistral model', () => {
    const result = getProviderForModel('mistral-large-latest', {
      GEMINI: 'gemini-key',
      MISTRAL: 'mistral-key',
    });

    expect(result).toEqual({ provider: 'MISTRAL', apiKey: 'mistral-key' });
  });
});
