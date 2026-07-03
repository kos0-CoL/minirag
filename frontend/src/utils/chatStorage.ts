interface LocalMessage {
  id: string;
  role: 'user' | 'assistant';
  contenido: string;
  documentosUtilizados?: string[];
  desdeCache?: boolean;
  rechazado?: boolean;
  timestamp: string;
}

interface LocalChat {
  id: string;
  titulo: string;
  modo: string;
  k: number;
  mensajes: LocalMessage[];
  createdAt: string;
  updatedAt: string;
}

const CHATS_KEY = 'minirag_chats';

export function loadChats(): LocalChat[] {
  try {
    const chats: LocalChat[] = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    // Migrate: fix duplicate message IDs + stale cache flags from old versions
    for (const chat of chats) {
      const seen = new Set<string>();
      chat.mensajes = chat.mensajes.map(m => {
        // Fix duplicate IDs
        let msg = m;
        if (seen.has(msg.id)) msg = { ...msg, id: crypto.randomUUID() };
        seen.add(msg.id);
        // Clean stale cache flags (old messages had desdeCache incorrectly)
        if (msg.desdeCache === true && msg.role === 'assistant') {
          msg = { ...msg, desdeCache: false };
        }
        return msg;
      });
    }
    return chats;
  }
  catch { return []; }
}

function saveChats(chats: LocalChat[]) {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function createLocalChat(titulo: string, config: { modo?: string; k?: number } = {}): LocalChat {
  const chats = loadChats();
  const chat: LocalChat = {
    id: crypto.randomUUID(),
    titulo,
    modo: config.modo || 'default',
    k: config.k || 3,
    mensajes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  chats.unshift(chat);
  saveChats(chats);
  return chat;
}

export function getLocalChat(chatId: string): LocalChat | undefined {
  return loadChats().find(c => c.id === chatId);
}

export function addLocalMessage(chatId: string, msg: Omit<LocalMessage, 'timestamp'> & { timestamp?: Date }) {
  const chats = loadChats();
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;

  const message: LocalMessage = {
    ...msg,
    timestamp: (msg.timestamp || new Date()).toISOString(),
  };
  chat.mensajes.push(message);
  chat.updatedAt = new Date().toISOString();

  // Auto-title from first user message
  if (chat.titulo === 'Nuevo Chat' && msg.role === 'user') {
    chat.titulo = msg.contenido.slice(0, 50) + (msg.contenido.length > 50 ? '...' : '');
  }

  saveChats(chats);
}

export function deleteLocalChat(chatId: string) {
  saveChats(loadChats().filter(c => c.id !== chatId));
}

export function updateLocalChat(chatId: string, data: Partial<LocalChat>) {
  const chats = loadChats();
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;
  Object.assign(chat, data, { updatedAt: new Date().toISOString() });
  saveChats(chats);
}
