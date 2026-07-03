import { AGENTES_PREDEFINIDOS, SKILLS_PREDEFINIDAS } from '@/data/agentsSkills';
import { saveAgents } from '@/data/agentsSkills';

export interface RepoItem {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'agent' | 'skill';
  categoria: string;
  autor: string;
  autorId: string;
  isSystem: boolean;
  copyCount: number;
  likes: number;
  createdAt: string;
  instrucciones?: string;
  activo: boolean;
}

const REPO_AGENTS_KEY = 'minirag_repo_agents';
const REPO_SKILLS_KEY = 'minirag_repo_skills';
const REPO_LIKES_KEY = 'minirag_repo_likes';
const USER_IMPORTS_KEY = 'minirag_user_imports';

const CATEGORIES: Record<string, string> = {
  general: 'AI Specialists', researcher: 'AI Specialists', technical: 'Development Team',
  coder: 'Development Team', dataScientist: 'Data & Analytics', devops: 'Infrastructure',
  security: 'Security', designer: 'Design', marketing: 'Marketing',
  writer: 'Content Creation', translator: 'Content Creation',
  teacher: 'Education', scientist: 'Research', economist: 'Business & Finance',
  lawyer: 'Legal', doctor: 'Healthcare', historian: 'Research',
  philosopher: 'Research', journalist: 'Content Creation',
  summarizer: 'Content Creation',
  rag: 'Core Engine', translate: 'Content Creation', summarize: 'Content Creation',
  chunking: 'Core Engine', embedding: 'Core Engine',
  qa: 'Core Engine', similarity: 'Core Engine',
  'pdf-parse': 'File Processing', 'docx-parse': 'File Processing',
  'web-scrape': 'Data Collection', 'keyword-extract': 'Data Analysis',
  'language-detect': 'Data Analysis', 'analyze-sentiment': 'Data Analysis',
  'text-to-speech': 'Audio/Video', 'speech-to-text': 'Audio/Video',
  ocr: 'File Processing', 'data-viz': 'Data & Analytics',
  'chart-gen': 'Data & Analytics', classify: 'Data Analysis',
  'json-transform': 'Development Team', 'report-gen': 'Data & Analytics',
  'code-exec': 'Development Team', 'image-gen': 'Creative',
  'web-search': 'Data Collection', 'extract-entities': 'Data Analysis',
};

export function getRepoItems(): RepoItem[] {
  const items: RepoItem[] = [];

  // System agents
  for (const a of AGENTES_PREDEFINIDOS) {
    items.push({
      id: `sys-${a.id}`, nombre: a.nombre, descripcion: a.descripcion,
      tipo: 'agent', categoria: CATEGORIES[a.id] || 'General',
      autor: 'Mini RAG', autorId: 'system',
      isSystem: true, copyCount: 0, likes: 0,
      createdAt: '2025-01-01T00:00:00Z',
      instrucciones: a.instrucciones, activo: true,
    });
  }

  // System skills
  for (const s of SKILLS_PREDEFINIDAS) {
    items.push({
      id: `sys-sk-${s.id}`, nombre: s.nombre, descripcion: s.descripcion,
      tipo: 'skill', categoria: CATEGORIES[s.id] || 'General',
      autor: 'Mini RAG', autorId: 'system',
      isSystem: true, copyCount: 0, likes: 0,
      createdAt: '2025-01-01T00:00:00Z',
      activo: true,
    });
  }

  // Community agents/skills from localStorage
  try {
    const community = JSON.parse(localStorage.getItem(REPO_AGENTS_KEY) || '[]');
    for (const c of community) {
      items.push({ ...c, isSystem: false });
    }
  } catch {}

  // Merge saved copy counts & likes
  try {
    const savedCopies = JSON.parse(localStorage.getItem(REPO_AGENTS_KEY + '_copies') || '{}');
    const savedLikes = JSON.parse(localStorage.getItem(REPO_LIKES_KEY) || '{}');
    for (const item of items) {
      item.copyCount = savedCopies[item.id] || item.copyCount;
      item.likes = savedLikes[item.id] || item.likes;
    }
  } catch {}

  return items;
}

export function getUserImports(): string[] {
  try { return JSON.parse(localStorage.getItem(USER_IMPORTS_KEY) || '[]'); }
  catch { return []; }
}

export function addUserImport(itemId: string): boolean {
  const imports = getUserImports();
  if (imports.includes(itemId)) return false;
  imports.push(itemId);
  localStorage.setItem(USER_IMPORTS_KEY, JSON.stringify(imports));

  // Increment copy count
  const copies = JSON.parse(localStorage.getItem(REPO_AGENTS_KEY + '_copies') || '{}');
  copies[itemId] = (copies[itemId] || 0) + 1;
  localStorage.setItem(REPO_AGENTS_KEY + '_copies', JSON.stringify(copies));

  // If it's a system agent, clone it to user's local agents
  if (itemId.startsWith('sys-')) {
    const agentId = itemId.replace('sys-', '');
    const agent = AGENTES_PREDEFINIDOS.find(a => a.id === agentId);
    if (agent) {
      const stored = JSON.parse(localStorage.getItem('minirag_agents') || '[]');
      const exists = stored.find((a: any) => a.id === agent.id);
      if (!exists) {
        stored.push({ ...agent, activo: true });
        saveAgents(stored);
      }
    }
  }
  // If it's a system skill
  if (itemId.startsWith('sys-sk-')) {
    const skillId = itemId.replace('sys-sk-', '');
    const skill = SKILLS_PREDEFINIDAS.find(s => s.id === skillId);
    if (skill) {
      const stored = JSON.parse(localStorage.getItem('minirag_skills') || '[]');
      const exists = stored.find((s: any) => s.id === skill.id);
      if (!exists) {
        stored.push({ ...skill, activo: true });
        localStorage.setItem('minirag_skills', JSON.stringify(stored));
      }
    }
  }

  return true;
}

export function toggleLike(itemId: string): boolean {
  const likes = JSON.parse(localStorage.getItem(REPO_LIKES_KEY) || '{}');
  const userLikes = JSON.parse(localStorage.getItem(REPO_LIKES_KEY + '_user') || '{}');
  const userId = localStorage.getItem('auth_token') || 'anon';
  const userKey = `${userId}_${itemId}`;

  if (userLikes[userKey]) {
    likes[itemId] = Math.max(0, (likes[itemId] || 1) - 1);
    delete userLikes[userKey];
  } else {
    likes[itemId] = (likes[itemId] || 0) + 1;
    userLikes[userKey] = true;
  }

  localStorage.setItem(REPO_LIKES_KEY, JSON.stringify(likes));
  localStorage.setItem(REPO_LIKES_KEY + '_user', JSON.stringify(userLikes));
  return !userLikes[userKey];
}

export function hasUserLiked(itemId: string): boolean {
  const userLikes = JSON.parse(localStorage.getItem(REPO_LIKES_KEY + '_user') || '{}');
  const userId = localStorage.getItem('auth_token') || 'anon';
  return !!userLikes[`${userId}_${itemId}`];
}

export function getUserName(): string {
  try {
    const user = JSON.parse(localStorage.getItem('user_profile') || '{}');
    return user.nombre || 'Usuario';
  } catch { return 'Usuario'; }
}
