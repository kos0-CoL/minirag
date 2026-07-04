import axios, { AxiosInstance } from 'axios';

class ApiClient {
  client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      // In sviluppo usa il proxy di Vite ( /api ),
      // In produzione usa l'URL completo dal backend
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 60000,
    });

    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.client.interceptors.response.use(
      (r) => r.data,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        throw error.response?.data || error;
      }
    );
  }

  // Auth
  async registro(email: string, nombre: string, password: string) {
    return this.client.post('/auth/registro', { email, nombre, password });
  }
  async login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }
  async googleAuth(googleToken: string) {
    return this.client.post('/auth/google', { googleToken });
  }
  async profile(): Promise<any> {
    return this.client.get('/auth/profile');
  }
  async updateProfile(data: { nombre?: string; preferences?: Record<string, any> }): Promise<any> {
    return this.client.put('/auth/profile', data);
  }

  // Chats
  async crearChat(titulo: string, config?: any) {
    return this.client.post('/chats', { titulo, ...config });
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

  // Queries
  async hacerPregunta(chatId: string, query: string, opciones?: any, contexto?: string) {
    return this.client.post('/queries/ask', { chatId, query, ...opciones, contexto });
  }

  // Documents
  async cargarDocumento(chatId: string, file: File) {
    const fd = new FormData();
    fd.append('archivo', file);
    fd.append('chatId', chatId);
    return this.client.post('/documents/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  async obtenerDocumentos() {
    return this.client.get('/documents');
  }
  async eliminarDocumento(docId: string) {
    return this.client.delete(`/documents/${docId}`);
  }

  // Agents
  async obtenerAgentes() {
    return this.client.get('/agents');
  }
}

export const apiClient = new ApiClient();
