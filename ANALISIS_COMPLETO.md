# Mini RAG Pro - Análisis & Especificación de Arquitectura

## 1. ANÁLISIS DEL HTML MONOÁRQUIVO

### Componentes Identificados

#### 1.1 Frontend (HTML/CSS/JS)
- **UI Framework**: Tailwind CSS
- **Librerías externas**:
  - `pdf.js` - Lectura de PDFs
  - `html2pdf.js` - Exportar a PDF
  - Vanilla JS + DOM API

**Funcionalidades**:
- Chat múltiple con historial (IndexedDB)
- Upload y procesamiento de documentos
- Gestor de agentes custom
- Selector de modelos Gemini
- Caché en localStorage
- Tema claro/oscuro
- Modo RAG con ajuste de K resultados

#### 1.2 Backend Embebido (JavaScript puro)
**Responsabilidades**:
- Gestión de documentos (extracción de texto, chunking)
- Cache manager (localStorage)
- Chat manager (IndexedDB)
- Agent manager
- API calls a Gemini con fallback

**Límites**:
- Sin persistencia server-side
- API key de usuario visible en client
- Sin autenticación real
- Embedding y búsqueda simulados
- Sin vector DB

#### 1.3 Integración Externa
- **Gemini API** para generación de texto
- **Embedding simulado** (búsqueda por relevancia keyword)

---

## 2. ESTRUCTURA DE LA ARQUITECTURA REAL

### 2.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React/TS)                      │
│  ├─ Chat UI (Sidebar, Messages, Input)                      │
│  ├─ Document Management                                      │
│  ├─ Agent Builder                                            │
│  └─ Settings & Config                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Express/Node.js)                   │
│  ├─ Auth Service (JWT)                                      │
│  ├─ Chat Manager Service                                     │
│  ├─ Document Processing Service                             │
│  │  ├─ Text extraction (PDF, DOCX, TXT)                    │
│  │  ├─ Chunking algorithm                                   │
│  │  └─ Embedding queue (Bull)                               │
│  ├─ Query/RAG Service                                        │
│  │  ├─ Retrieval (Similarity search)                        │
│  │  ├─ Prompt engineering                                   │
│  │  └─ Gemini API caller                                    │
│  ├─ Agent Management Service                                │
│  └─ Cache Service (Redis)                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    ┌───────┐  ┌──────────┐  ┌────────────┐
    │ DB    │  │ Redis    │  │ File Store │
    │ PG    │  │ Cache    │  │ S3/Local   │
    └───────┘  └──────────┘  └────────────┘
        │
        └──▶ TypeORM Entities
             ├─ User
             ├─ Chat
             ├─ Message
             ├─ Document
             ├─ DocumentChunk
             ├─ Agent
             └─ CacheEntry
```

### 2.2 Flujo de Datos RAG

```
USER QUERY
    │
    ▼
┌─────────────────────────────────────────┐
│ Frontend: Enviar query + chat context   │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ Backend: Query Service                  │
├─────────────────────────────────────────┤
│ 1. Verificar caché (Redis)              │
│    ├─ Si hit: retornar respuesta        │
│    └─ Si miss: continuar                │
│                                          │
│ 2. RETRIEVAL                            │
│    ├─ Obtener embedding del query       │
│    │  (Gemini embedding-001)            │
│    ├─ Buscar chunks similares (pgvector)│
│    └─ Top-K chunks recuperados          │
│                                          │
│ 3. CONTEXT BUILDING                    │
│    └─ Concatenar chunks + metadatos     │
│                                          │
│ 4. PROMPT ENGINEERING                   │
│    ├─ Instrucciones del agente          │
│    ├─ Contexto RAG                      │
│    ├─ Historial (follow-up)             │
│    └─ Parámetros del modo               │
│                                          │
│ 5. LLAMAR A GEMINI                      │
│    └─ Enviar prompt vía API             │
│                                          │
│ 6. FORMATEAR RESPUESTA                  │
│    └─ Markdown → HTML                   │
│                                          │
│ 7. GUARDAR EN CACHÉ                     │
│    └─ Redis TTL 7 días                  │
│                                          │
│ 8. PERSISTIR EN DB                      │
│    ├─ Guardar mensaje user              │
│    ├─ Guardar mensaje assistant         │
│    └─ Actualizar stats                  │
└─────────────────────┬───────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────┐
│ Frontend: Renderizar respuesta           │
│ ├─ Mostrar respuesta formateada         │
│ ├─ Mostrar fuentes (badges)             │
│ ├─ Indicador "desde caché"              │
│ └─ Tiempo de respuesta                  │
└─────────────────────────────────────────┘
```

### 2.3 Flujo de Procesamiento de Documentos

```
USER UPLOADS DOCUMENT
    │
    ▼
┌────────────────────────────────────────────┐
│ Frontend: cargarDocumento()                │
│ ├─ Mostrar form de metadatos              │
│ └─ Enviar file + metadata vía multipart   │
└────────────────────┬───────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────┐
│ Backend: DocumentController.upload()       │
│                                            │
│ 1. VALIDAR                                │
│    ├─ Auth (user id)                      │
│    ├─ File type                           │
│    └─ File size limit                     │
│                                            │
│ 2. GUARDAR FILE                           │
│    ├─ LocalFS o S3                        │
│    └─ Generar URL de acceso               │
│                                            │
│ 3. CREAR DOCUMENTO EN DB                  │
│    └─ Document entity con metadatos       │
│                                            │
│ 4. EXTRAER TEXTO                          │
│    ├─ PDF: pdf-parse                      │
│    ├─ DOCX: docx-parser                   │
│    ├─ TXT: UTF-8 decode                   │
│    └─ HTML: strip tags                    │
│                                            │
│ 5. CHUNKING                               │
│    ├─ Tamaño: 1000 chars                 │
│    ├─ Solapamiento: 200 chars            │
│    └─ Crear DocumentChunk entities       │
│                                            │
│ 6. ENCOLAR TAREA DE EMBEDDING             │
│    ├─ Bull queue: embedDocumentChunks    │
│    └─ Job priority: 1 (alta)             │
└────────────────────┬───────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────┐
│ Async Job: EmbedWorker (Bull)              │
│                                            │
│ Para cada DocumentChunk:                  │
│ 1. Obtener embedding (Gemini API)        │
│ 2. Guardar en DB (documento_chunks.embedding) │
│ 3. Actualizar chunk status                │
│ 4. Si error: retry con exponential backoff│
└────────────────────┬───────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────┐
│ Frontend: Notificar al usuario             │
│ ├─ "Documento indexado"                   │
│ ├─ Mostrar badge "Listo"                  │
│ └─ Permitir usar en RAG queries           │
└────────────────────────────────────────────┘
```

---

## 3. ESTRUCTURA DE BASE DE DATOS

### Tablas principales

```sql
-- USERS
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  nombre VARCHAR(255),
  passwordHash VARCHAR(255),
  geminiApiKey TEXT, -- encrypted
  preferences JSONB,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

-- CHATS
CREATE TABLE chats (
  id UUID PRIMARY KEY,
  titulo VARCHAR(255),
  descripcion TEXT,
  modo VARCHAR(50) -- 'default', 'research', 'creative', 'technical'
  k INTEGER DEFAULT 3,
  configuracion JSONB,
  usuarioId UUID REFERENCES users(id),
  documentosIds UUID[] DEFAULT '{}',
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  INDEX (usuarioId, createdAt)
);

-- MESSAGES
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chatId UUID REFERENCES chats(id) ON DELETE CASCADE,
  role ENUM('user', 'assistant', 'system'),
  contenido TEXT,
  metadata JSONB,
  documentosUtilizados UUID[] DEFAULT '{}',
  desdeCache BOOLEAN DEFAULT false,
  tiempoRespuesta FLOAT,
  createdAt TIMESTAMP
);

-- DOCUMENTS
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  nombre VARCHAR(255),
  tipo VARCHAR(50), -- 'pdf', 'txt', 'docx'
  urlAlmacenamiento TEXT,
  tamanio INTEGER,
  usuarioId UUID REFERENCES users(id),
  metadatos JSONB, -- {autor, fecha, tema, idioma}
  totalChunks INTEGER DEFAULT 0,
  chunksIndexados INTEGER DEFAULT 0,
  indexado BOOLEAN DEFAULT false,
  indexadoAt TIMESTAMP,
  createdAt TIMESTAMP,
  INDEX (usuarioId, createdAt)
);

-- DOCUMENT_CHUNKS
CREATE TABLE document_chunks (
  id UUID PRIMARY KEY,
  documentoId UUID REFERENCES documents(id) ON DELETE CASCADE,
  indice INTEGER,
  contenido TEXT,
  inicio INTEGER,
  fin INTEGER,
  embedding REAL[] -- pgvector para búsqueda
  metadatos JSONB,
  score FLOAT,
  INDEX (documentoId, indice)
);

-- AGENTS
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  nombre VARCHAR(255),
  descripcion TEXT,
  instrucciones TEXT,
  tipo VARCHAR(50), -- 'general', 'researcher', 'summarizer'
  usuarioId UUID REFERENCES users(id),
  configuracionModelo JSONB, -- {temp, topP, maxTokens}
  activo BOOLEAN DEFAULT true,
  usoTotal INTEGER DEFAULT 0,
  createdAt TIMESTAMP
);

-- CACHE_ENTRIES (para queries frecuentes)
CREATE TABLE cache_entries (
  id UUID PRIMARY KEY,
  usuarioId UUID REFERENCES users(id),
  hash VARCHAR(64),
  query TEXT,
  respuesta TEXT,
  documentosUtilizados UUID[] DEFAULT '{}',
  modelo VARCHAR(50),
  agente VARCHAR(100),
  hits INTEGER DEFAULT 1,
  createdAt TIMESTAMP,
  expiresAt TIMESTAMP,
  INDEX (usuarioId, hash)
);
```

---

## 4. API ENDPOINTS

### Authentication
```
POST   /api/auth/registro
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/profile
```

### Chats
```
POST   /api/chats                      # Crear nuevo chat
GET    /api/chats                      # Obtener todos
GET    /api/chats/:id                  # Obtener detalle
PUT    /api/chats/:id                  # Actualizar config
DELETE /api/chats/:id                  # Eliminar
POST   /api/chats/:id/limpiar          # Limpiar mensajes
```

### Queries (RAG)
```
POST   /api/queries/ask                # Main query endpoint
  Body: {chatId, query, agente, modelo, k, modo, followUp}
  Returns: {messageId, respuesta, documentosUtilizados, desdeCache, tiempoMs}

GET    /api/queries/cache              # Estadísticas
DELETE /api/queries/cache/:id          # Limpiar entrada
POST   /api/queries/cache/clear-all    # Limpiar todo
```

### Documentos
```
POST   /api/documents/upload           # Cargar documento
GET    /api/documents                  # Obtener todos
GET    /api/documents/:id              # Obtener detalle
DELETE /api/documents/:id              # Eliminar
POST   /api/documents/:id/reintentar   # Reintentar indexado
```

### Agentes
```
POST   /api/agents                     # Crear agente
GET    /api/agents                     # Obtener todos
GET    /api/agents/:id                 # Obtener detalle
PUT    /api/agents/:id                 # Actualizar
DELETE /api/agents/:id                 # Eliminar
```

---

## 5. DIFERENCIAS CLAVE: Monolítico vs Backend/Frontend

| Aspecto | HTML Monoárquivo | Backend Real |
|---------|-----------------|--------------|
| **Auth** | Ninguna (API key user-facing) | JWT + contraseña |
| **Persistencia** | LocalStorage + IndexedDB (client) | PostgreSQL (server) |
| **Embedding** | Simulado | Gemini API + pgvector |
| **Búsqueda** | Keyword matching | Vector similarity (cosine) |
| **Caché** | localStorage (5MB limit) | Redis (sin límite) |
| **Documentos** | En memoria | File storage + DB metadata |
| **Escalabilidad** | 1 usuario | Multi-tenant |
| **Seguridad** | API key visible | API key encriptada server-side |
| **Async jobs** | setTimeout | Bull queue (Redis) |
| **Deployment** | Static HTML | Docker + DB + Redis |

---

## 6. EXTRACTOS DEL HTML MAPEADOS A BACKEND

### 6.1 DocumentManager → DocumentService
```js
// HTML (client-side)
extraerYAgregar(files, metadatos) → 
  • Lee archivo con FileReader
  • Genera chunks en memoria
  • Guarda en IndexedDB

// Backend (server-side)
procesarDocumento(file, usuarioId, metadatos) →
  • Lee archivo en disk
  • Extrae texto con pdf-parse/docx-parser
  • Chunking con overlap
  • Guarda en PostgreSQL
  • Encola embedding job
```

### 6.2 ChatManager → Chat Service + Message Repo
```js
// HTML
crearChat(), cambiarChat(), agregarMensaje() →
  • Gestión en IndexedDB

// Backend
chatService.crear(), chatService.obtenerTodos() →
  • Persistencia en PostgreSQL
  • Relaciones con Messages y Documents
```

### 6.3 APIManager → Query Service
```js
// HTML
enviarPregunta(query, apiKey, agente, modelo, ...) →
  • Llamada directa a Gemini
  • Embedding "simulado"
  • Búsqueda por keyword en chunks locales

// Backend
queryService.procesarQuery() →
  1. Retrieval: similaritySearch() con pgvector
  2. Prompt engineering
  3. Gemini API call
  4. Response formatting
  5. Save to cache + DB
```

### 6.4 CacheManager → Redis Cache
```js
// HTML
cacheManger.guardar/obtener() →
  • localStorage (JSON stringified)
  • Max 5MB per browser

// Backend
redisCache.set/get() →
  • Redis backend
  • TTL: 7 días
  • Unlimitado por browser
  • Compartido entre dispositivos (same user)
```

---

## 7. STACK RECOMENDADO

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL + pgvector
- **Cache**: Redis
- **Queue**: Bull (Bull MQ)
- **ORM**: TypeORM
- **Auth**: JWT + bcrypt
- **PDF Parsing**: pdf-parse
- **Document Parsing**: docx-parser, mammoth
- **External API**: axios

### Frontend
- **Framework**: React 18 + TypeScript
- **State**: Zustand
- **HTTP Client**: Axios
- **Router**: React Router v6
- **Styling**: Tailwind CSS
- **Build**: Vite
- **UI Icons**: lucide-react

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **CI/CD**: GitHub Actions
- **Hosting**: 
  - Frontend: Vercel, Netlify, AWS S3 + CloudFront
  - Backend: Render, Railway, AWS ECS
  - DB: AWS RDS, Render, Supabase

---

## 8. CRONOGRAMA APROXIMADO

| Fase | Tarea | Duración |
|------|-------|----------|
| **Setup** | Init repos, tooling, DB schema | 1-2 días |
| **Backend Phase 1** | Auth, Chat & Message APIs, basic entities | 3-4 días |
| **Backend Phase 2** | Document upload, extraction, chunking | 2-3 días |
| **Backend Phase 3** | RAG query service, Gemini integration | 2-3 días |
| **Backend Phase 4** | Agents, cache, async jobs (Bull) | 2-3 días |
| **Frontend Phase 1** | Layout, auth pages, chat components | 3-4 días |
| **Frontend Phase 2** | Document upload UI, messages, styling | 2-3 días |
| **Frontend Phase 3** | Settings, agents UI, integración API | 2-3 días |
| **Integration** | E2E tests, deployment setup | 2-3 días |
| **Polish** | Bug fixes, perf optimization, docs | 2-3 días |

**Total estimado**: 22-32 días de desarrollo

---

## Archivos Generados

✅ Backend estructura  
✅ Database entities (7 tablas)  
✅ Services (Query, Document, Auth)  
✅ Routes & Controllers básicos  
✅ Frontend store (Zustand)  
✅ API Client  
✅ Component structure  
✅ Este análisis detallado
