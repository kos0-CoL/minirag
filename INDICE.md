# Mini RAG Pro - Índice Completo & Guía de Navegación

## 📋 Contenido del Proyecto

### 📄 Documentación Principal

| Archivo | Descripción | Público |
|---------|-------------|---------|
| **README.md** | Guía rápida de setup y uso | ✅ Primero leer |
| **ANALISIS_COMPLETO.md** | Análisis arquitectónico, DB schema, flujos | ✅ Referencia |
| **EXTRACCION_COMPONENTES.md** | Mapeo HTML → Backend modular | ✅ Técnico |
| **INDICE.md** | Este archivo | ✅ Navegación |

---

## 🏗️ Backend (Node.js + Express)

### Estructura
```
mini-rag-backend/
├── server.js                     # Entry point del servidor
├── package.json                  # Dependencias npm
├── Dockerfile                    # Containerización
├── .env.example                  # Template de variables
└── src/
    ├── entities/                 # TypeORM entities (DB schema)
    │   ├── User.ts              # Usuarios + preferencias
    │   ├── Chat.ts              # Chats + configuración
    │   ├── Message.ts           # Mensajes de chat
    │   ├── Document.ts          # Documentos cargados
    │   ├── DocumentChunk.ts     # Chunks indexados
    │   ├── Agent.ts             # Agentes custom
    │   └── CacheEntry.ts        # Caché persistente
    │
    ├── routes/                   # API endpoints
    │   ├── auth.ts              # POST /login, /register
    │   ├── chats.ts             # CRUD de chats
    │   ├── documents.ts         # Upload y gestión
    │   ├── agents.ts            # Agentes custom
    │   └── queries.ts           # POST /queries/ask (MAIN)
    │
    ├── services/                 # Business logic
    │   ├── queryService.js      # RAG: retrieval + Gemini
    │   ├── documentService.js   # Procesamiento archivos
    │   ├── authService.ts       # JWT + passwords
    │   ├── chatService.ts       # Gestión de chats
    │   └── cacheService.ts      # Redis cache
    │
    ├── middleware/               # Express middleware
    │   ├── auth.ts              # JWT verification
    │   ├── validation.ts        # Joi schemas
    │   └── errorHandler.ts      # Centralizado error handling
    │
    └── controllers/              # Request handlers
        ├── chatController.ts
        ├── documentController.ts
        ├── queryController.ts
        └── agentController.ts
```

### Archivos Clave Entregados

✅ **server.js** - Servidor Express con middleware
✅ **package.json** - Dependencias completas
✅ **src/entities/*** - 7 entidades TypeORM para DB
✅ **src/routes/queries.js** - Endpoint RAG principal
✅ **src/services/queryService.js** - Lógica RAG (retrieval + Gemini)
✅ **src/services/documentService.js** - Procesamiento de documentos
✅ **.env.example** - Variables de configuración

### Próximo: Implementar
- [ ] Controllers y routes restantes (auth, chats, documents, agents)
- [ ] Middleware de validación (Joi)
- [ ] Database connection (TypeORM)
- [ ] Redis cache implementation
- [ ] Bull queue para embedding async
- [ ] Tests con Jest + Supertest

---

## ⚛️ Frontend (React + TypeScript + Vite)

### Estructura
```
mini-rag-frontend/
├── package.json                  # React + deps
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config
├── STRUCTURE.md                 # Árbol completo de componentes
│
└── src/
    ├── components/              # React components (ver STRUCTURE.md)
    │   ├── auth/               # LoginForm, RegisterForm
    │   ├── chat/               # ChatWindow, MessageList, InputArea
    │   ├── sidebar/            # Sidebar, ChatsList
    │   ├── documents/          # DocumentUpload, DocumentsList
    │   ├── agents/             # AgentSelector, AgentManager
    │   ├── settings/           # SettingsPanel, ModelSelector
    │   ├── common/             # Header, Footer, Loader, Modal
    │   └── layout/             # MainLayout
    │
    ├── store/                   # Zustand state management
    │   └── useAppStore.ts      # Store global con slices
    │
    ├── services/                # API integration
    │   ├── apiClient.ts        # Axios client con interceptors
    │   ├── geminiService.ts    # Gemini integrations
    │   └── storageService.ts   # LocalStorage utilities
    │
    ├── hooks/                   # Custom React hooks
    │   ├── useChat.ts          # Chat operations
    │   ├── useDocuments.ts     # Document operations
    │   ├── useAgents.ts        # Agent management
    │   ├── useApi.ts           # API calls wrapper
    │   └── useNotification.ts  # Toast notifications
    │
    ├── types/                   # TypeScript definitions
    │   ├── index.ts            # Main types export
    │   ├── api.ts              # API response types
    │   ├── entities.ts         # Entity types
    │   └── store.ts            # Store state types
    │
    ├── pages/                   # Page components
    │   ├── HomePage.tsx
    │   ├── ChatPage.tsx        # Main app page
    │   ├── DocumentsPage.tsx
    │   ├── SettingsPage.tsx
    │   ├── LoginPage.tsx
    │   └── RegisterPage.tsx
    │
    ├── utils/                   # Utility functions
    │   ├── formatters.ts
    │   ├── validators.ts
    │   ├── constants.ts
    │   └── helpers.ts
    │
    ├── styles/                  # CSS & Tailwind
    │   ├── globals.css
    │   ├── tailwind.css
    │   └── variables.css
    │
    ├── App.tsx                  # Root component
    └── main.tsx                 # Entry point
```

### Archivos Clave Entregados

✅ **package.json** - React + TypeScript + Vite
✅ **src/store/useAppStore.ts** - Zustand store global
✅ **src/services/apiClient.ts** - Cliente HTTP centralizado
✅ **STRUCTURE.md** - Árbol completo de componentes

### Próximo: Implementar
- [ ] Componentes React (usar STRUCTURE.md como referencia)
- [ ] Pages y routing (React Router)
- [ ] Custom hooks para chat, documents, agents
- [ ] UI styling (Tailwind)
- [ ] Theme toggle (light/dark)
- [ ] Tests con Vitest
- [ ] Build y optimizaciones

---

## 🗄️ Base de Datos (PostgreSQL)

### Schema Entregado (TypeORM)

**Tablas principales:**
1. **users** - Usuarios registrados
2. **chats** - Conversaciones
3. **messages** - Historial de mensajes
4. **documents** - Documentos cargados
5. **document_chunks** - Chunks indexados (con embedding vector)
6. **agents** - Agentes custom
7. **cache_entries** - Query cache persistente

**Características:**
- Foreign keys con ON DELETE CASCADE
- Índices para queries frecuentes
- JSONB para metadatos flexibles
- UUID para IDs
- Timestamps (createdAt, updatedAt)

**Para crear BD:**
```sql
-- Ver archivo init.sql (TODO generarlo)
-- O usar: npm run migrate
```

---

## 🚀 Deployment

### Docker (Recomendado)

**docker-compose.yml** - Incluido
```
Servicios:
  ├─ postgres:15-alpine
  ├─ redis:7-alpine
  ├─ backend (Express)
  └─ frontend (React dev)
```

**Quick start:**
```bash
docker-compose up -d
# http://localhost:3000 (Frontend)
# http://localhost:5000/api (Backend)
```

### Alternativas

| Plataforma | Frontend | Backend | DB |
|-----------|----------|---------|-----|
| **Vercel + Render** | Vercel | Render.com | Render Postgres |
| **AWS** | S3 + CloudFront | ECS + ALB | RDS |
| **Google Cloud** | Cloud Storage | Cloud Run | Cloud SQL |
| **Railway** | Railway | Railway | Railway Postgres |

---

## 📊 Flujos Principales Documentados

### 1. RAG Query Flow
**Ver:** ANALISIS_COMPLETO.md → "Flujo de Datos RAG"
- User query → Retrieval → Context building → Prompt engineering → Gemini → Response

### 2. Document Processing Flow
**Ver:** ANALISIS_COMPLETO.md → "Flujo de Procesamiento de Documentos"
- Upload → Validation → Text extraction → Chunking → Embedding queue → Indexing

### 3. Authentication Flow
**Necesario implementar:**
- Register: email + password → hash → DB
- Login: email + password → verify → JWT token
- Protected routes: JWT middleware

---

## 🔑 API Endpoints Completos

### Auth
```
POST   /api/auth/registro       {email, nombre, password}
POST   /api/auth/login          {email, password} → {token, user}
POST   /api/auth/refresh        {} → {token}
POST   /api/auth/logout         {}
GET    /api/auth/profile        → {user}
```

### Chats
```
POST   /api/chats               {titulo}
GET    /api/chats               → {chats[]}
GET    /api/chats/:id           → {chat}
PUT    /api/chats/:id           {titulo, modo, k, ...}
DELETE /api/chats/:id
```

### Queries (RAG) ⭐
```
POST   /api/queries/ask
  Request: {
    chatId: string,
    query: string,
    agente?: string,
    modelo?: string,
    k?: number,
    modo?: string,
    followUp?: boolean
  }
  
  Response: {
    messageId: string,
    respuesta: string (HTML),
    documentosUtilizados: string[],
    desdeCache: boolean,
    tiempoMs: number
  }

GET    /api/queries/cache       → {total, hitsTotal, entries[]}
DELETE /api/queries/cache/:id
```

### Documentos
```
POST   /api/documents/upload    (FormData)
GET    /api/documents           → {documents[]}
GET    /api/documents/:id       → {document}
DELETE /api/documents/:id
```

### Agentes
```
POST   /api/agents              {nombre, descripcion, instrucciones, tipo}
GET    /api/agents              → {agents[]}
PUT    /api/agents/:id          {nombre, descripcion, ...}
DELETE /api/agents/:id
```

---

## 📚 Cómo Usar Este Proyecto

### Para Desarrolladores

1. **Entender arquitectura:**
   - Leer: ANALISIS_COMPLETO.md
   - Leer: EXTRACCION_COMPONENTES.md

2. **Setup local:**
   ```bash
   # Backend
   cd mini-rag-backend
   npm install
   cp .env.example .env
   npm run dev
   
   # Frontend (otra terminal)
   cd mini-rag-frontend
   npm install
   npm run dev
   ```

3. **Desarrollo iterativo:**
   - Backend services en `src/services/`
   - Frontend components en `src/components/` (ver STRUCTURE.md)
   - Store state en `src/store/useAppStore.ts`

4. **Testing:**
   - Backend: `npm test`
   - Frontend: `npm test`

### Para DevOps

1. **Containerizar:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

2. **Deploy a producción:**
   - Frontend → Vercel / S3 + CloudFront
   - Backend → Render / Railway / ECS
   - Database → Managed PostgreSQL
   - Cache → Managed Redis

3. **Monitoreo:**
   - Logs: `docker-compose logs -f`
   - Health checks: `GET /health`
   - Database: pgAdmin, DBeaver
   - Redis: redis-cli, Redis Commander

### Para Product Managers

1. **Entender features:**
   - RAG: Retrieval + respuestas contextuales
   - Multi-chat: Múltiples conversaciones
   - Custom agents: Instrucciones personalizadas
   - Document management: Upload y indexación
   - Caching: Respuestas rápidas a queries repetidas

2. **Métricas:**
   - Query latency (tiempoMs)
   - Cache hit rate
   - Documents indexed
   - Active sessions

---

## 🔧 Checklist de Implementación

### Backend (50% completado)
- [x] Project setup (server.js, package.json)
- [x] DB entities (TypeORM)
- [x] QueryService (RAG logic)
- [x] DocumentService (processing)
- [ ] Controllers (CRUD endpoints)
- [ ] Auth middleware
- [ ] Validation schemas
- [ ] Error handling
- [ ] Tests
- [ ] Docker setup

### Frontend (30% completado)
- [x] Project setup (Vite, React, TypeScript)
- [x] Zustand store structure
- [x] API client (axios)
- [ ] Components (chat, sidebar, documents, agents)
- [ ] Pages (login, chat, settings)
- [ ] Styling (Tailwind)
- [ ] Theme toggle
- [ ] Forms y validación
- [ ] Tests
- [ ] PWA features

### DevOps (20% completado)
- [x] Docker setup
- [x] docker-compose para dev
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Monitoring (DataDog, New Relic)
- [ ] Backup strategy
- [ ] SSL/TLS setup
- [ ] Rate limiting

---

## 📞 Soporte & Contacto

**Preguntas sobre:**
- Arquitectura → Ver ANALISIS_COMPLETO.md
- Componentes → Ver EXTRACCION_COMPONENTES.md + STRUCTURE.md
- Setup → Ver README.md
- API → Ver ANALISIS_COMPLETO.md § 4

**Contribuir:**
- Fork → Branch → Develop → PR
- Tests antes de merge
- Código debe pasar linting

**Issues comunes:**
- DB connection → Revisar .env y docker-compose
- CORS errors → Revisar FRONTEND_URL en .env
- Gemini API → Agregar GEMINI_API_KEY válida
- Redis → `redis-cli ping` debe responder PONG

---

## 📈 Roadmap Futuro

**Corto plazo (v1.0):**
- [x] MVP con RAG basic
- [ ] Autenticación real
- [ ] Multi-documento por chat
- [ ] Caché distribuido

**Mediano plazo (v1.5):**
- [ ] pgvector para búsqueda semántica
- [ ] Streaming responses (SSE)
- [ ] Soporte múltiples LLMs
- [ ] Dashboard de analytics

**Largo plazo (v2.0):**
- [ ] Compartir chats entre usuarios
- [ ] Workspace/Teams
- [ ] Integración con Slack, Discord
- [ ] Mobile app (React Native)
- [ ] Embeddings custom

---

## 📄 Licencia & Legal

- **Licencia:** MIT
- **Autor:** Nazareno
- **Última actualización:** Junio 2026
- **Estado:** Beta (MVP completado, puliendo features)

---

**👉 Comenzar por:** Leer README.md → ANALISIS_COMPLETO.md → Implementar backend services

**Bienvenido! 🚀**
