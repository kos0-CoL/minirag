/**
 * API Client Service
 * Centraliza todas las llamadas a la API backend
 */
import axios, { AxiosInstance } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para agregar token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para manejar errores
    this.client.interceptors.response.use(
      response => response.data,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        throw error.response?.data || error;
      }
    );
  }

  // ========== AUTH ==========
  async registro(email: string, nombre: string, password: string) {
    return this.client.post('/auth/registro', { email, nombre, password });
  }

  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  // ========== CHATS ==========
  async crearChat(titulo: string) {
    return this.client.post('/chats', { titulo });
  }

  async obtenerChats() {
    return this.client.get('/chats');
  }

  async obtenerChat(chatId: string) {
    return this.client.get(`/chats/${chatId}`);
  }

  async actualizarChat(chatId: string, datos: any) {
    return this.client.put(`/chats/${chatId}`, datos);
  }

  async eliminarChat(chatId: string) {
    return this.client.delete(`/chats/${chatId}`);
  }

  // ========== QUERIES (RAG) ==========
  async hacerPregunta(
    chatId: string,
    query: string,
    opciones: {
      agente?: string;
      modelo?: string;
      k?: number;
      modo?: string;
      followUp?: boolean;
    }
  ) {
    return this.client.post('/queries/ask', {
      chatId,
      query,
      ...opciones
    });
  }

  async obtenerCacheStats() {
    return this.client.get('/queries/cache');
  }

  async limpiarCache(id: string) {
    return this.client.delete(`/queries/cache/${id}`);
  }

  // ========== DOCUMENTOS ==========
  async cargarDocumento(
    chatId: string,
    file: File,
    metadatos?: { autor?: string; fecha?: string; tema?: string }
  ) {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('chatId', chatId);
    if (metadatos) {
      formData.append('metadatos', JSON.stringify(metadatos));
    }

    return this.client.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  async obtenerDocumentos(chatId?: string) {
    return this.client.get('/documents', {
      params: chatId ? { chatId } : undefined
    });
  }

  async eliminarDocumento(docId: string) {
    return this.client.delete(`/documents/${docId}`);
  }

  async obtenerDocumento(docId: string) {
    return this.client.get(`/documents/${docId}`);
  }

  // ========== AGENTES ==========
  async crearAgente(datos: any) {
    return this.client.post('/agents', datos);
  }

  async obtenerAgentes() {
    return this.client.get('/agents');
  }

  async actualizarAgente(agenteId: string, datos: any) {
    return this.client.put(`/agents/${agenteId}`, datos);
  }

  async eliminarAgente(agenteId: string) {
    return this.client.delete(`/agents/${agenteId}`);
  }
}

export const apiClient = new ApiClient();
