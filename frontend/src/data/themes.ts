export interface Theme {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  colors: {
    primary: string;
    'primary-hover': string;
    bg: string;
    'bg-card': string;
    'bg-sidebar': string;
    'bg-chat': string;
    text: string;
    'text-secondary': string;
    border: string;
    accent: string;
    'accent-light': string;
    'btn-text': string;
    shadow: string;
  };
  font: string;
}

export const THEMAS: Theme[] = [
  {
    id: 'light',
    nombre: 'Claro',
    descripcion: 'Tema claro clásico con acentos azules',
    icono: '☀️',
    colors: {
      primary: '#2563eb',
      'primary-hover': '#1d4ed8',
      bg: '#ffffff',
      'bg-card': '#ffffff',
      'bg-sidebar': '#f8fafc',
      'bg-chat': '#f0f4f8',
      text: '#1e293b',
      'text-secondary': '#64748b',
      border: '#e2e8f0',
      accent: '#3b82f6',
      'accent-light': '#dbeafe',
      'btn-text': '#ffffff',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    font: "'Inter', system-ui, sans-serif",
  },
  {
    id: 'dark',
    nombre: 'Oscuro',
    descripcion: 'Tema oscuro moderno',
    icono: '🌙',
    colors: {
      primary: '#60a5fa',
      'primary-hover': '#3b82f6',
      bg: '#0f172a',
      'bg-card': '#1e293b',
      'bg-sidebar': '#0f172a',
      'bg-chat': '#1e293b',
      text: '#e2e8f0',
      'text-secondary': '#94a3b8',
      border: '#334155',
      accent: '#3b82f6',
      'accent-light': '#1e3a5f',
      'btn-text': '#ffffff',
      shadow: '0 1px 3px rgba(0,0,0,0.3)',
    },
    font: "'Inter', system-ui, sans-serif",
  },
  {
    id: 'professional',
    nombre: 'Azul Profesional',
    descripcion: 'Tonos azul-pizarra elegantes',
    icono: '💼',
    colors: {
      primary: '#1e40af',
      'primary-hover': '#1e3a8a',
      bg: '#f1f5f9',
      'bg-card': '#ffffff',
      'bg-sidebar': '#1e293b',
      'bg-chat': '#f8fafc',
      text: '#0f172a',
      'text-secondary': '#475569',
      border: '#cbd5e1',
      accent: '#1e40af',
      'accent-light': '#dbeafe',
      'btn-text': '#ffffff',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    font: "'Georgia', 'Times New Roman', serif",
  },
  {
    id: 'natural',
    nombre: 'Verde Natural',
    descripcion: 'Tonos verdes cálidos y naturales',
    icono: '🌿',
    colors: {
      primary: '#15803d',
      'primary-hover': '#166534',
      bg: '#f0fdf4',
      'bg-card': '#ffffff',
      'bg-sidebar': '#f0fdf4',
      'bg-chat': '#f7fee7',
      text: '#1a2e1a',
      'text-secondary': '#4a7c59',
      border: '#bbf7d0',
      accent: '#16a34a',
      'accent-light': '#dcfce7',
      'btn-text': '#ffffff',
      shadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    font: "'Inter', system-ui, sans-serif",
  },
  {
    id: 'minimal',
    nombre: 'Minimalista',
    descripcion: 'Máximo contraste, mínimo adorno',
    icono: '⚪',
    colors: {
      primary: '#000000',
      'primary-hover': '#333333',
      bg: '#ffffff',
      'bg-card': '#ffffff',
      'bg-sidebar': '#fafafa',
      'bg-chat': '#ffffff',
      text: '#000000',
      'text-secondary': '#666666',
      border: '#e5e5e5',
      accent: '#000000',
      'accent-light': '#f5f5f5',
      'btn-text': '#ffffff',
      shadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    font: "'Helvetica Neue', 'Arial', sans-serif",
  },
];

export function getTheme(id: string): Theme {
  return THEMAS.find(t => t.id === id) || THEMAS[0];
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const c = theme.colors;
  root.style.setProperty('--theme-primary', c.primary);
  root.style.setProperty('--theme-primary-hover', c['primary-hover']);
  root.style.setProperty('--theme-bg', c.bg);
  root.style.setProperty('--theme-bg-card', c['bg-card']);
  root.style.setProperty('--theme-bg-sidebar', c['bg-sidebar']);
  root.style.setProperty('--theme-bg-chat', c['bg-chat']);
  root.style.setProperty('--theme-text', c.text);
  root.style.setProperty('--theme-text-secondary', c['text-secondary']);
  root.style.setProperty('--theme-border', c.border);
  root.style.setProperty('--theme-accent', c.accent);
  root.style.setProperty('--theme-accent-light', c['accent-light']);
  root.style.setProperty('--theme-btn-text', c['btn-text']);
  root.style.setProperty('--theme-shadow', c.shadow);
  root.style.setProperty('--theme-surface', c['bg-sidebar']);
  root.style.setProperty('--theme-ring', c.primary);
  root.style.setProperty('--theme-font', theme.font);
  root.style.fontFamily = theme.font;

  // Toggle dark class for Tailwind dark: variants
  const isDark = theme.id === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
}
