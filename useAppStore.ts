/**
 * Zustand Store - Gestión de estado global
 */
import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  contenido: string;
  documentosUtilizados?: string[];
  desdeCache?: boolean;
  timestamp: Date;
}

interface Chat {
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
}

interface AppStore {
  // Auth
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  // Chats
  chatActual: Chat | null;
  chats: Chat[];
  setChatActual: (chat: Chat | null) => void;
  agregarMensaje: (chatId: string, mensaje: Message) => void;
  crearChat: (chat: Chat) => void;
  actualizarChat: (chat: Chat) => void;
  eliminarChat: (chatId: string) => void;

  // UI
  loading: boolean;
  setLoading: (loading: boolean) => void;
  tema: 'light' | 'dark';
  toggleTema: () => void;
  mostrarSidebar: boolean;
  toggleSidebar: () => void;

  // Documentos
  documentos: any[];
  agregarDocumento: (doc: any) => void;
  eliminarDocumento: (docId: string) => void;

  // Agentes
  agentes: any[];
  agenteActual: string;
  setAgenteActual: (agente: string) => void;

  // Config
  modelo: string;
  setModelo: (modelo: string) => void;
  kResultados: number;
  setKResultados: (k: number) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Auth state
  user: null,
  token: localStorage.getItem('auth_token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
    set({ token });
  },
  logout: () => {
    set({ user: null, token: null, chatActual: null, chats: [] });
    localStorage.removeItem('auth_token');
  },

  // Chats state
  chatActual: null,
  chats: [],
  setChatActual: (chat) => set({ chatActual: chat }),
  agregarMensaje: (chatId, mensaje) => {
    set((state) => ({
      chatActual: state.chatActual?.id === chatId
        ? {
            ...state.chatActual,
            mensajes: [...state.chatActual.mensajes, mensaje],
            updatedAt: new Date()
          }
        : state.chatActual,
      chats: state.chats.map(c =>
        c.id === chatId
          ? { ...c, mensajes: [...c.mensajes, mensaje], updatedAt: new Date() }
          : c
      )
    }));
  },
  crearChat: (chat) => set((state) => ({
    chats: [chat, ...state.chats],
    chatActual: chat
  })),
  actualizarChat: (chat) => set((state) => ({
    chatActual: state.chatActual?.id === chat.id ? chat : state.chatActual,
    chats: state.chats.map(c => c.id === chat.id ? chat : c)
  })),
  eliminarChat: (chatId) => set((state) => ({
    chats: state.chats.filter(c => c.id !== chatId),
    chatActual: state.chatActual?.id === chatId ? null : state.chatActual
  })),

  // UI state
  loading: false,
  setLoading: (loading) => set({ loading }),
  tema: (localStorage.getItem('tema') as any) || 'light',
  toggleTema: () => set((state) => {
    const nuevoTema = state.tema === 'light' ? 'dark' : 'light';
    localStorage.setItem('tema', nuevoTema);
    return { tema: nuevoTema };
  }),
  mostrarSidebar: true,
  toggleSidebar: () => set((state) => ({ mostrarSidebar: !state.mostrarSidebar })),

  // Documentos
  documentos: [],
  agregarDocumento: (doc) => set((state) => ({
    documentos: [doc, ...state.documentos]
  })),
  eliminarDocumento: (docId) => set((state) => ({
    documentos: state.documentos.filter(d => d.id !== docId)
  })),

  // Agentes
  agentes: [],
  agenteActual: 'general',
  setAgenteActual: (agente) => set({ agenteActual: agente }),

  // Config
  modelo: 'gemini-pro',
  setModelo: (modelo) => set({ modelo }),
  kResultados: 3,
  setKResultados: (k) => set({ kResultados: k })
}));
