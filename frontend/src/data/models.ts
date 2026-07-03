export interface ProviderModel {
  id: string;
  nombre: string;
  provider: string;
}

export const PROVIDER_MODELS: ProviderModel[] = [
  // Gemini - current as of July 2026
  { id: 'gemini-2.5-flash', nombre: 'Gemini 2.5 Flash', provider: 'GEMINI' },
  { id: 'gemini-2.5-flash-8b', nombre: 'Gemini 2.5 Flash 8B', provider: 'GEMINI' },
  { id: 'gemini-2.5-pro', nombre: 'Gemini 2.5 Pro', provider: 'GEMINI' },
  // OpenAI
  { id: 'gpt-4o', nombre: 'GPT-4o', provider: 'OPENAI' },
  { id: 'gpt-4o-mini', nombre: 'GPT-4o Mini', provider: 'OPENAI' },
  // Anthropic
  { id: 'claude-sonnet-4-20250514', nombre: 'Claude Sonnet 4', provider: 'ANTHROPIC' },
  { id: 'claude-haiku-3-5-20241022', nombre: 'Claude Haiku 3.5', provider: 'ANTHROPIC' },
  // Cohere
  { id: 'command-r-plus', nombre: 'Command R+', provider: 'COHERE' },
  // Mistral
  { id: 'mistral-large-latest', nombre: 'Mistral Large', provider: 'MISTRAL' },
];

export function getAvailableModels(apiKeys: Record<string, string>): ProviderModel[] {
  const active = Object.entries(apiKeys)
    .filter(([_, val]) => val && val.length > 5)
    .map(([key]) => key);

  // Merge dynamic models fetched from APIs (Gemini models from Google API)
  let merged = [...PROVIDER_MODELS];
  try {
    const raw = localStorage.getItem('minirag_dynamic_models');
    if (raw) {
      const dynamic: Record<string, ProviderModel[]> = JSON.parse(raw);
      for (const [provider, models] of Object.entries(dynamic)) {
        if (models.length > 0) {
          // Replace static models for this provider with dynamic ones
          merged = merged.filter(m => m.provider !== provider);
          merged.push(...models);
        }
      }
    }
  } catch {}

  if (active.length === 0) {
    return merged.filter(m => m.provider === 'GEMINI');
  }
  return merged.filter(m => active.includes(m.provider));
}

export const PROVIDER_LABELS: Record<string, string> = {
  GEMINI: 'Google Gemini',
  OPENAI: 'OpenAI',
  ANTHROPIC: 'Anthropic Claude',
  COHERE: 'Cohere',
  MISTRAL: 'Mistral AI',
};
