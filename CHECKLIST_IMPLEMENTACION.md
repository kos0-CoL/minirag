# ✅ Checklist de Implementación - Mini RAG Pro

## 📋 Tabla de Contenidos
1. [Backend](#backend)
2. [Frontend](#frontend)
3. [Database](#database)
4. [Testing](#testing)
5. [Deployment](#deployment)

---

## 🖥️ Backend

### Phase 1: Controllers & Routes (Prioridad: ALTA)
- [ ] **AuthController**
  - [ ] POST `/auth/registro` - validar input, hash password, crear usuario
  - [ ] POST `/auth/login` - verificar credentials, generar JWT
  - [ ] POST `/auth/refresh` - refresh token
  - [ ] POST `/auth/logout` - invalidar token
  - [ ] GET `/auth/profile` - obtener perfil usuario

- [ ] **ChatController**
  - [ ] POST `/chats` - crear nuevo chat
  - [ ] GET `/chats` - listar chats del usuario
  - [ ] GET `/chats/:id` - obtener detalle
  - [ ] PUT `/chats/:id` - actualizar config (modo, k, titulo)
  - [ ] DELETE `/chats/:id` - eliminar chat

- [ ] **MessageController** (implícito en QueryController)
  - [ ] Guardar mensajes user/assistant en DB
  - [ ] Actualizar con documentos utilizados

- [ ] **DocumentController**
  - [ ] POST `/documents/upload` - recibir FormData, llamar documentService
  - [ ] GET `/documents` - listar documentos del usuario
  - [ ] GET `/documents/:id` - obtener detalle
  - [ ] DELETE `/documents/:id` - eliminar documento

- [ ] **AgentController**
  - [ ] POST `/agents` - crear agente custom
  - [ ] GET `/agents` - listar agentes
  - [ ] PUT `/agents/:id` - actualizar instrucciones
  - [ ] DELETE `/agents/:id` - eliminar agente

### Phase 2: Middleware (Prioridad: ALTA)
- [ ] **Auth Middleware**
  - [ ] Verificar JWT en Authorization header
  - [ ] Extraer user ID del token
  - [ ] Pasar user a siguiente middleware
  - [ ] Retornar 401 si no hay token

- [ ] **Validation Middleware**
  - [ ] Joi schemas para cada endpoint
  - [ ] POST body validation
  - [ ] Query params validation
  - [ ] Error messages en español

- [ ] **Error Handler**
  - [ ] Catch todos los errores
  - [ ] Log a stderr
  - [ ] Retornar formato JSON consistente
  - [ ] Status codes apropiados (400, 401, 404, 500)

### Phase 3: Database Integration (Prioridad: ALTA)
- [ ] **TypeORM Setup**
  - [ ] Crear connection en server.js
  - [ ] Cargar todas las entidades
  - [ ] Crear migrations (schema)
  - [ ] Seed de agentes predefinidos

- [ ] **Repositories**
  - [ ] UserRepository (find, create, update)
  - [ ] ChatRepository (find, create, update, delete)
  - [ ] MessageRepository (save, findByChatId)
  - [ ] DocumentRepository (find, create, delete)
  - [ ] DocumentChunkRepository (findByDocumento, findByIds)
  - [ ] AgentRepository (find, create, update)
  - [ ] CacheEntryRepository (find, save, delete, expire)

### Phase 4: Services Completion (Prioridad: MEDIA)
- [ ] **QueryService**
  - [ ] ✅ retrieval() - COMPLETADO
  - [ ] ✅ construirContexto() - COMPLETADO
  - [ ] ✅ generarPrompt() - COMPLETADO
  - [ ] ✅ llamarGemini() - COMPLETADO
  - [ ] ✅ formatearRespuesta() - COMPLETADO
  - [ ] ✅ hashQuery() - COMPLETADO
  - [ ] Agregar retry logic para Gemini API

- [ ] **DocumentService**
  - [ ] ✅ procesarDocumento() - COMPLETADO
  - [ ] ✅ extraerTexto() - COMPLETADO
  - [ ] ✅ generarChunks() - COMPLETADO
  - [ ] Implementar pdf-parse para PDFs reales
  - [ ] Implementar docx-parser para DOCX

- [ ] **AuthService** (NEW)
  - [ ] register(email, nombre, password)
  - [ ] login(email, password) → JWT
  - [ ] verificarPassword(plain, hash)
  - [ ] encriptarApiKey(apiKey) → encrypted
  - [ ] desencriptarApiKey(encrypted) → apiKey

- [ ] **ChatService** (NEW)
  - [ ] crear(usuarioId, titulo)
  - [ ] obtenerTodos(usuarioId)
  - [ ] obtener(chatId, usuarioId)
  - [ ] actualizar(chatId, usuarioId, datos)
  - [ ] eliminar(chatId, usuarioId)

### Phase 5: Cache & Async Jobs (Prioridad: MEDIA)
- [ ] **Redis Cache**
  - [ ] Conexión a Redis
  - [ ] CacheService.set(key, value, ttl)
  - [ ] CacheService.get(key)
  - [ ] CacheService.delete(key)

- [ ] **Bull Queue**
  - [ ] Crear queue para "embedDocuments"
  - [ ] Worker que procesa chunks
  - [ ] Llamar Gemini para cada chunk
  - [ ] Actualizar DB con embeddings
  - [ ] Retry logic en fallos

### Phase 6: Testing (Prioridad: MEDIA)
- [ ] **Unit Tests**
  - [ ] queryService.retrieval()
  - [ ] queryService.generarPrompt()
  - [ ] documentService.generarChunks()
  - [ ] documentService.extraerTexto()

- [ ] **Integration Tests**
  - [ ] POST /chats → crear chat
  - [ ] POST /documents/upload → procesar doc
  - [ ] POST /queries/ask → obtener respuesta
  - [ ] GET /queries/cache → obtener stats

- [ ] **E2E Tests**
  - [ ] Login + crear chat + hacer pregunta
  - [ ] Upload documento + esperar indexado + usar en query
  - [ ] Crear agente custom + usar en query

---

## ⚛️ Frontend

### Phase 1: Pages & Layout (Prioridad: ALTA)
- [ ] **MainLayout**
  - [ ] Header con tema toggle + user menu
  - [ ] Sidebar con navegación
  - [ ] Main content area
  - [ ] Footer (opcional)

- [ ] **Pages**
  - [ ] HomePage (landing)
  - [ ] LoginPage (form + submit)
  - [ ] RegisterPage (form + submit)
  - [ ] ChatPage (main app)
  - [ ] DocumentsPage (gestor)
  - [ ] SettingsPage (config)
  - [ ] NotFoundPage (404)

- [ ] **ProtectedRoute**
  - [ ] Verificar token en localStorage
  - [ ] Redirigir a login si no autenticado
  - [ ] Pasar user a rutas protegidas

### Phase 2: Chat Components (Prioridad: ALTA)
- [ ] **ChatWindow**
  - [ ] Renderizar ChatPage
  - [ ] Integrar MessageList + InputArea
  - [ ] Manejar carga de mensajes

- [ ] **MessageList**
  - [ ] Mapear mensajes del estado
  - [ ] Renderizar MessageBubble para cada uno
  - [ ] Auto-scroll al final

- [ ] **MessageBubble**
  - [ ] Mostrar avatar (user/assistant)
  - [ ] Mostrar contenido HTML formateado
  - [ ] Mostrar timestamp
  - [ ] Mostrar loading spinner en proceso

- [ ] **InputArea**
  - [ ] Textarea para input
  - [ ] Botón send
  - [ ] Integración file upload
  - [ ] Enter para enviar, Shift+Enter para nueva línea

- [ ] **MessageSources**
  - [ ] Mostrar badges de documentos utilizados
  - [ ] Modal al hacer click (mostrar content del documento)
  - [ ] Link directo a documento

### Phase 3: Sidebar Components (Prioridad: ALTA)
- [ ] **Sidebar**
  - [ ] Toggle para responsive
  - [ ] ChatsList component
  - [ ] NewChatButton
  - [ ] UserMenu

- [ ] **ChatsList**
  - [ ] Listar chats del usuario
  - [ ] Indicar chat activo
  - [ ] Botón delete por item

- [ ] **ChatItem**
  - [ ] Mostrar título + fecha
  - [ ] Click para cambiar chat
  - [ ] Hover state
  - [ ] Delete confirm modal

### Phase 4: Document Components (Prioridad: MEDIA)
- [ ] **DocumentUpload**
  - [ ] Input file
  - [ ] Form metadatos (autor, fecha, tema)
  - [ ] Submit button
  - [ ] Progress bar
  - [ ] Status message

- [ ] **DocumentsList**
  - [ ] Listar documentos del chat
  - [ ] Mostrar nombre, tamaño, estado indexado
  - [ ] Loading spinner mientras indexa
  - [ ] Delete button

- [ ] **DocumentItem**
  - [ ] Mostrar metadata
  - [ ] Click para ver contenido
  - [ ] Indicador "Indexado" vs "Indexando"
  - [ ] Delete button

### Phase 5: Settings & Config (Prioridad: MEDIA)
- [ ] **SettingsPanel**
  - [ ] ModelSelector
  - [ ] KSelector (1-5)
  - [ ] ModeSelector (default, research, creative, technical)
  - [ ] ThemeToggle (light/dark)
  - [ ] ApiKeyForm (Gemini)

- [ ] **AgentSelector**
  - [ ] Dropdown con agentes
  - [ ] Preview de instrucciones
  - [ ] Create new agent button

- [ ] **AgentManager** (Modal)
  - [ ] Form crear agente
  - [ ] Campos: nombre, descripcion, instrucciones, tipo
  - [ ] Listar agentes existentes
  - [ ] Edit / Delete

### Phase 6: Common Components (Prioridad: BAJA)
- [ ] **Header**
- [ ] **Footer** (opcional)
- [ ] **Loader** (spinner)
- [ ] **Modal**
- [ ] **Toast** (notifications)
- [ ] **Badge**
- [ ] **Button**

### Phase 7: Styling (Prioridad: MEDIA)
- [ ] **Global Styles**
  - [ ] Tailwind config
  - [ ] CSS variables (colors, fonts)
  - [ ] Dark mode support

- [ ] **Component Styling**
  - [ ] Cada componente con Tailwind classes
  - [ ] Responsive design (mobile, tablet, desktop)
  - [ ] Hover/focus states

### Phase 8: Testing (Prioridad: BAJA)
- [ ] **Component Tests**
  - [ ] MessageBubble renders correctly
  - [ ] InputArea submits query
  - [ ] ChatsList updates on new chat

- [ ] **Integration Tests**
  - [ ] Login → ChatPage
  - [ ] Create chat → send message
  - [ ] Upload document → use in query

---

## 🗄️ Database

### Setup (Prioridad: ALTA)
- [ ] PostgreSQL 15 running
- [ ] Create database `mini_rag_pro`
- [ ] Create user/password
- [ ] TypeORM connection configured

### Migrations (Prioridad: ALTA)
- [ ] Crear tablas:
  - [ ] users
  - [ ] chats
  - [ ] messages
  - [ ] documents
  - [ ] document_chunks
  - [ ] agents
  - [ ] cache_entries

- [ ] Crear índices:
  - [ ] users.email (UNIQUE)
  - [ ] chats(usuarioId, createdAt)
  - [ ] messages(chatId, createdAt)
  - [ ] documents(usuarioId, createdAt)
  - [ ] document_chunks(documentoId, indice)
  - [ ] cache_entries(usuarioId, hash)

### Seeding (Prioridad: MEDIA)
- [ ] Crear agentes predefinidos (general, researcher, etc)
- [ ] Crear usuario de test (email: test@test.com)

### Optimización (Prioridad: BAJA)
- [ ] Agregar pgvector extension para embeddings
- [ ] Crear índices para búsqueda de vectores

---

## 🧪 Testing

### Unit Tests (Prioridad: MEDIA)
- [ ] Services:
  - [ ] queryService.retrieval()
  - [ ] queryService.formatearRespuesta()
  - [ ] documentService.generarChunks()
  - [ ] documentService.extraerTexto()

### Integration Tests (Prioridad: MEDIA)
- [ ] Controllers:
  - [ ] POST /auth/login
  - [ ] POST /chats
  - [ ] POST /documents/upload
  - [ ] POST /queries/ask

### E2E Tests (Prioridad: BAJA)
- [ ] User flow:
  - [ ] Register + Login
  - [ ] Create chat
  - [ ] Upload document
  - [ ] Ask question
  - [ ] Get response with sources

---

## 🚀 Deployment

### Development (Prioridad: ALTA)
- [ ] Docker setup
- [ ] docker-compose.yml funcionando
- [ ] All containers running
- [ ] Frontend accessible en localhost:3000
- [ ] Backend accessible en localhost:5000

### Production (Prioridad: BAJA)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Build script
- [ ] Deploy script
- [ ] Monitoring setup
- [ ] Logging (Sentry, DataDog)

### Documentation (Prioridad: MEDIA)
- [ ] API docs (Swagger/OpenAPI)
- [ ] Deployment guide
- [ ] Architecture decision records
- [ ] Troubleshooting guide

---

## 📊 Progress Tracking

### Backend
- [ ] Phase 1: 0/5 controllers × 2-3 days = 6-15 days
- [ ] Phase 2: Middleware = 2 days
- [ ] Phase 3: Database = 2 days
- [ ] Phase 4: Services = 2 days
- [ ] Phase 5: Cache/Jobs = 2 days
- [ ] Phase 6: Testing = 2 days
**Subtotal: 18-25 days**

### Frontend
- [ ] Phase 1: Layout/Pages = 3 days
- [ ] Phase 2: Chat components = 3 days
- [ ] Phase 3: Sidebar = 2 days
- [ ] Phase 4: Documents = 2 days
- [ ] Phase 5: Settings = 2 days
- [ ] Phase 6: Common = 1 day
- [ ] Phase 7: Styling = 2 days
- [ ] Phase 8: Testing = 2 days
**Subtotal: 17 days**

### Total: 35-42 days (5-6 semanas)

---

## 🎯 MVP Minimum (Priority: CRITICAL)

Lo mínimo para tener un MVP funcional:

### Backend
- [x] Server setup
- [ ] Auth (login/register)
- [ ] Chat CRUD
- [ ] Document upload
- [ ] Query endpoint
- [x] Services (logic)

### Frontend
- [ ] Login page
- [ ] Chat page
- [ ] Message UI
- [ ] Upload UI
- [ ] Settings

### Database
- [ ] PostgreSQL schema
- [ ] 7 entidades

**Tiempo MVP: 10-14 días**

---

## ⚠️ Blockers & Risks

- [ ] PostgreSQL not running → Setup requerido
- [ ] Gemini API key inválida → Verificar key
- [ ] Redis not running → Setup requerido
- [ ] JWT secret not configured → Agregar a .env
- [ ] CORS issues → Configurar FRONTEND_URL
- [ ] Embedding API limits → Batching necesario

---

## 📝 Notes

- Usar `npm run dev` para development con hot reload
- Usar `npm test` frecuentemente
- Commit pequeños y frecuentes
- PRs antes de merge a main
- Review code antes de deploy

---

**Última actualización**: Junio 2026
**Estado**: Ready for Implementation
