import { create } from 'zustand';
import {
  loadChats, createLocalChat, addLocalMessage, deleteLocalChat, updateLocalChat
} from '@/utils/chatStorage';
import { loadAgents, saveAgents, Agent } from '@/data/agentsSkills';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  contenido: string;
  documentosUtilizados?: string[];
  desdeCache?: boolean;
  rechazado?: boolean;
  timestamp: Date;
}

export interface Chat {
  id: string;
  titulo: string;
  modo: string;
  k: number;
  mensajes: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  nombre: string;
  preferences?: Record<string, any>;
}

interface AppStore {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setUserProfile: (user: User) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  chatActual: Chat | null;
  chats: Chat[];
  setChatActual: (chat: Chat | null) => void;
  agregarMensaje: (chatId: string, mensaje: Message) => void;
  crearChat: (titulo: string, config?: { modo?: string; k?: number }) => Chat;
  eliminarChat: (chatId: string) => void;
  cargarChats: () => void;

  loading: boolean;
  setLoading: (loading: boolean) => void;
  tema: string;
  setTema: (id: string) => void;
  mostrarSidebar: boolean;
  toggleSidebar: () => void;

  documentos: any[];
  setDocumentos: (docs: any[]) => void;
  agregarDocumento: (doc: any) => void;
  eliminarDocumento: (docId: string) => void;

  agentes: Agent[];
  setAgentes: (agents: Agent[]) => void;
  agenteActual: string;
  setAgenteActual: (agente: string) => void;
  cargarAgentes: () => void;
  actualizarAgenteInstrucciones: (id: string, instrucciones: string) => void;

  modelo: string;
  setModelo: (modelo: string) => void;
  kResultados: number;
  setKResultados: (k: number) => void;
  chunkSize: number;
  setChunkSize: (size: number) => void;
  modoRespuesta: 'quick' | 'detailed';
  setModoRespuesta: (mode: 'quick' | 'detailed') => void;
  followUp: boolean;
  setFollowUp: (val: boolean) => void;
  historialContexto: string[];
  agregarHistorial: (q: string, r: string) => void;
  limpiarHistorial: () => void;

  mensajeError: string | null;
  setMensajeError: (msg: string | null) => void;

  isGuest: boolean;
  setIsGuest: (val: boolean) => void;
}

function hydrateChat(c: any): Chat {
  return {
    ...c,
    mensajes: (c.mensajes || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
  };
}

/** Clean stale flags from old messages loaded from localStorage */
function cleanMensajes(msgs: Message[]): Message[] {
  return msgs.map(m => {
    if (m.role === 'assistant' && m.desdeCache === true) {
      return { ...m, desdeCache: false };
    }
    return m;
  });
}

export const useAppStore = create<AppStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  setUser: (user) => set({ user }),
  setUserProfile: (user) => {
    localStorage.setItem('user_profile', JSON.stringify(user));
    set({ user, isGuest: false });
  },
  setToken: (token) => {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
    set({ token, isGuest: !token });
  },
  logout: () => {
    set({ user: null, token: null, chatActual: null, chats: [], isGuest: true });
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_profile');
  },

  chatActual: null,
  chats: [],
  setChatActual: (chat) => set({
    chatActual: chat ? { ...chat, mensajes: cleanMensajes(chat.mensajes) } : null
  }),
  agregarMensaje: (chatId, mensaje) => {
    addLocalMessage(chatId, mensaje as any);
    set((state) => {
      const newMsg = { ...mensaje };
      const nuevaMensajes = (chat: any) => {
        const msgs = [...cleanMensajes(chat.mensajes || []), newMsg];
        let titulo = chat.titulo;
        if (titulo === 'Nuevo Chat' && mensaje.role === 'user') {
          titulo = mensaje.contenido.slice(0, 50) + (mensaje.contenido.length > 50 ? '...' : '');
        }
        return { ...chat, mensajes: msgs, titulo, updatedAt: new Date() };
      };
      return {
        chatActual: state.chatActual?.id === chatId ? nuevaMensajes(state.chatActual) : state.chatActual,
        chats: state.chats.map(c => c.id === chatId ? nuevaMensajes(c) : c),
      };
    });
  },
  crearChat: (titulo, config = {}) => {
    const chat = createLocalChat(titulo, config);
    const hydrated = hydrateChat(chat);
    set((state) => ({ chats: [hydrated, ...state.chats], chatActual: hydrated }));
    return hydrated;
  },
  eliminarChat: (chatId) => {
    deleteLocalChat(chatId);
    set((state) => ({
      chats: state.chats.filter(c => c.id !== chatId),
      chatActual: state.chatActual?.id === chatId ? null : state.chatActual,
    }));
  },
  cargarChats: () => {
    const chats = loadChats().map(hydrateChat);
    set((state) => {
      // Also update chatActual if it matches one of the loaded chats
      let chatActual = state.chatActual;
      if (chatActual) {
        const updated = chats.find(c => c.id === chatActual!.id);
        if (updated) chatActual = updated;
      }
      return { chats, chatActual };
    });
  },

  loading: false,
  setLoading: (loading) => set({ loading }),
  tema: localStorage.getItem('minirag_tema') || 'light',
  setTema: (id) => {
    localStorage.setItem('minirag_tema', id);
    set({ tema: id });
  },
  mostrarSidebar: true,
  toggleSidebar: () => set((s) => ({ mostrarSidebar: !s.mostrarSidebar })),

  documentos: [],
  setDocumentos: (docs) => set({ documentos: docs }),
  agregarDocumento: (doc) => set((s) => ({ documentos: [doc, ...s.documentos] })),
  eliminarDocumento: (docId) => set((s) => ({ documentos: s.documentos.filter(d => d.id !== docId) })),

  agentes: loadAgents(),
  setAgentes: (agents) => set({ agentes: agents }),
  agenteActual: localStorage.getItem('minirag_agente_actual') || 'general',
  setAgenteActual: (agente) => {
    localStorage.setItem('minirag_agente_actual', agente);
    set({ agenteActual: agente });
  },
  cargarAgentes: () => set({ agentes: loadAgents() }),
  actualizarAgenteInstrucciones: (id, instrucciones) => set((state) => {
    const next = state.agentes.map(a => a.id === id ? { ...a, instrucciones } : a);
    saveAgents(next);
    return { agentes: next };
  }),

  modelo: 'gemini-2.5-flash',
  setModelo: (modelo) => set({ modelo }),
  kResultados: 3,
  setKResultados: (k) => set({ kResultados: k }),
  chunkSize: parseInt(localStorage.getItem('minirag_chunk_size') || '1000'),
  setChunkSize: (size) => {
    localStorage.setItem('minirag_chunk_size', String(size));
    set({ chunkSize: size });
  },
  modoRespuesta: (localStorage.getItem('minirag_modo') as any) || 'detailed',
  setModoRespuesta: (mode) => {
    localStorage.setItem('minirag_modo', mode);
    set({ modoRespuesta: mode });
  },
  followUp: localStorage.getItem('minirag_followup') === 'true',
  setFollowUp: (val) => {
    localStorage.setItem('minirag_followup', String(val));
    set({ followUp: val });
  },
  historialContexto: [],
  agregarHistorial: (q, r) => set((state) => {
    const next = [...state.historialContexto, `Usuario: ${q}`, `Asistente: ${r}`];
    return { historialContexto: next.slice(-6) };
  }),
  limpiarHistorial: () => set({ historialContexto: [] }),

  mensajeError: null,
  setMensajeError: (msg) => set({ mensajeError: msg }),

  isGuest: !localStorage.getItem('auth_token'),
  setIsGuest: (val) => set({ isGuest: val }),
}));
