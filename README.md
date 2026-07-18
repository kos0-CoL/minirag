# Mini RAG Pro - Web Real con Backend

Conversión de la aplicación monoárquivo HTML a una arquitectura profesional **Frontend (React) + Backend (Node/Express)**.

## 📁 Estructura de Proyecto

```
mini-rag-pro/
├── mini-rag-backend/          # API Express + DB
│   ├── src/
│   │   ├── entities/          # TypeORM entities (DB schema)
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── middleware/        # Auth, validation, error handling
│   │   └── controllers/       # Request handlers
│   ├── package.json
│   ├── Dockerfile
│   ├── server.js
│   └── .env.example
│
├── mini-rag-frontend/         # React + TS + Vite
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas
│   │   ├── store/             # Zustand state
│   │   ├── services/          # API client
│   │   ├── hooks/             # Custom hooks
│   │   └── types/             # TypeScript types
│   ├── package.json
│   ├── Dockerfile.dev
│   └── vite.config.ts
│
├── docker-compose.yml         # Orquestación dev
├── ANALISIS_COMPLETO.md       # Análisis detallado
└── README.md
```

## 🚀 Quick Start

### Requisitos
- Docker & Docker Compose
- O: Node.js 18+, PostgreSQL 15, Redis 7

### Opción 1: Con Docker (Recomendado)

```bash
# Clonar repo
git clone <repo>
cd mini-rag-pro

# Copiar variables de entorno
cp mini-rag-backend/.env.example mini-rag-backend/.env

# Editar .env y agregar tu GEMINI_API_KEY
nano mini-rag-backend/.env

# Iniciar servicios
docker-compose up -d

# Mirar logs
docker-compose logs -f

# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Swagger docs: http://localhost:5000/api-docs
```

### Opción 2: Setup Local

#### Backend
```bash
cd mini-rag-backend

# Instalar dependencias
npm install

# Copiar .env
cp .env.example .env
# Editar .env con tu DB local y Gemini API key

# Correr migraciones
npm run migrate

# Iniciar servidor
npm run dev
# Puerto: 5000
```

#### Frontend
```bash
cd mini-rag-frontend

# Instalar dependencias
npm install

# Crear .env.local
echo "VITE_API_URL=http://localhost:5000/api" > .env.local

# Iniciar dev server
npm run dev
# Puerto: 5173
```

## 📊 Componentes Principales

### Backend Services

#### 1. **QueryService** (RAG Logic)
```js
procesarQuery(query, chat, usuarioId, options)
  ├─ Retrieval: Buscar chunks similares en DB
  ├─ Context Building: Concatenar chunks relevantes
  ├─ Prompt Engineering: Crear prompt con instrucciones de agente
  ├─ Gemini API Call: Obtener respuesta
  ├─ Formatting: Markdown → HTML
  └─ Caching: Redis para futuras queries

Métodos:
  • retrieval(query, chat, k) - Busca vectorial
  • construirContexto(chunks, query)
  • generarPrompt(query, contexto, agente, modo)
  • llamarGemini(prompt, apiKey, modelo)
  • formatearRespuesta(texto)
  • hashQuery(query, agente, modelo) - Para caché
```

#### 2. **DocumentService** (Processing)
```js
procesarDocumento(file, usuarioId, metadatos)
  ├─ Extracción de texto (PDF, DOCX, TXT, HTML)
  ├─ Chunking con solapamiento
  ├─ Almacenamiento en BD
  └─ Encolar job de embedding

Métodos:
  • extraerTexto(file) - Detecta tipo y extrae
  • extraerDePDF(file) - pdf-parse
  • generarChunks(texto, opciones)
  • obtenerDocumentos(usuarioId)
  • eliminarDocumento(documentoId, usuarioId)
```

#### 3. **ChatService** (Chat Management)
- CRUD de chats
- Gestión de historial de mensajes
- Multi-documento por chat
- Configuración de parámetros RAG

#### 4. **AuthService** (Authentication)
- Registro + Login con JWT
- Password hashing con bcrypt
- Refresh token flow
- API key encryption

### Database Schema

```sql
users          ← Usuarios registrados
chats          ← Conversaciones
messages       ← Historial chat
documents      ← Documentos cargados
document_chunks ← Chunks indexados
agents         ← Agentes custom
cache_entries  ← Query cache (Redis backup)
```

### Frontend Store (Zustand)

```ts
useAppStore
  ├─ Auth: user, token, logout()
  ├─ Chats: chatActual, chats[], crearChat(), agregarMensaje()
  ├─ Documentos: documentos[], agregarDocumento()
  ├─ Agentes: agentes[], agenteActual
  ├─ Config: modelo, kResultados, tema
  └─ UI: loading, mostrarSidebar, tema (light/dark)
```

## 🔑 API Endpoints

### Auth
```
POST   /api/auth/registro          # {email, nombre, password}
POST   /api/auth/login             # {email, password}
GET    /api/auth/profile           # [token requerido]
POST   /api/auth/logout            # [token requerido]
```

### Chats
```
POST   /api/chats                  # {titulo}
GET    /api/chats                  # Obtener todos
GET    /api/chats/:id              # Detalle
PUT    /api/chats/:id              # Actualizar
DELETE /api/chats/:id              # Eliminar
```

### Queries (RAG - Main Endpoint)
```
POST   /api/queries/ask            # {chatId, query, agente, modelo, k, modo}
  Response: {
    messageId: string,
    respuesta: string (HTML),
    documentosUtilizados: string[],
    desdeCache: boolean,
    tiempoMs: number
  }

GET    /api/queries/cache          # Stats de caché
DELETE /api/queries/cache/:id      # Limpiar entrada
```

### Documentos
```
POST   /api/documents/upload       # FormData: {archivo, chatId, metadatos?}
GET    /api/documents              # Listar todos
GET    /api/documents/:id          # Detalle
DELETE /api/documents/:id          # Eliminar
```

### Agentes
```
POST   /api/agents                 # {nombre, descripcion, instrucciones, tipo}
GET    /api/agents                 # Listar
PUT    /api/agents/:id             # Actualizar
DELETE /api/agents/:id             # Eliminar
```

## 📝 Ejemplo de Uso

### 1. Registrarse e iniciar sesión
```js
const response = await apiClient.login('user@example.com', 'password');
// Returns: {token, user: {id, email, nombre}}
```

### 2. Crear chat
```js
const chat = await apiClient.crearChat('Mi primer RAG');
// {id: uuid, titulo, modo, k, ...}
```

### 3. Cargar documento
```js
const doc = await apiClient.cargarDocumento(
  chatId,
  file,
  {autor: 'John Doe', tema: 'Machine Learning'}
);
// {documentoId, nombre, chunks, tamanio}
// Backend: extrae, chunkeá, encola embedding
```

### 4. Hacer pregunta RAG
```js
const result = await apiClient.hacerPregunta(
  chatId,
  '¿Qué es machine learning?',
  {
    agente: 'researcher',
    modelo: 'gemini-pro',
    k: 3,
    modo: 'research',
    followUp: true
  }
);

// Response:
{
  messageId: "msg-uuid",
  respuesta: "<h2>Machine Learning</h2>...",
  documentosUtilizados: ["doc-1", "doc-2"],
  desdeCache: false,
  tiempoMs: 2340
}
```

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=mini_rag_pro

# Redis
REDIS_URL=redis://localhost:6379

# Gemini API
GEMINI_API_KEY=your_api_key_here

# JWT
JWT_SECRET=your_super_secret_key
JWT_EXPIRY=7d

# Storage
STORAGE_TYPE=local  # o 's3'
STORAGE_PATH=./uploads
```

## 🚢 Deployment

### Vercel (Frontend)
```bash
# Conectar repo GitHub → Vercel
# Configurar env vars en Vercel dashboard
# Automático en cada push a main
```

### Render.com o Railway (Backend)

1. **Conectar repo a Render/Railway**
2. **Crear PostgreSQL service**
3. **Crear Redis service**
4. **Crear Node web service**
5. **Configurar env vars:**
   - DB_HOST, DB_PORT, DB_USER, DB_PASSWORD
   - REDIS_URL
   - GEMINI_API_KEY
   - JWT_SECRET (cambiar en producción)
6. **Build command:** `npm install && npm run migrate`
7. **Start command:** `npm start`

### AWS (Producción)
- **Frontend:** S3 + CloudFront
- **Backend:** ECS + RDS + ElastiCache
- **Storage:** S3 para documentos

## 🧪 Testing

```bash
# Backend
cd mini-rag-backend
npm test

# Frontend
cd mini-rag-frontend
npm test
```

## 📚 Documentación

- [ANALISIS_COMPLETO.md](./ANALISIS_COMPLETO.md) - Análisis arquitectónico detallado
- Backend API Docs: `http://localhost:5000/api-docs` (Swagger)
- Frontend Components: Ver `mini-rag-frontend/STRUCTURE.md`

## 🔐 Seguridad

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ API key encryption en servidor
- ✅ SQL injection prevention (TypeORM)
- ✅ XSS protection (HTML escaping)
- ⚠️ TODO: Helmet security headers
- ⚠️ TODO: CSRF protection
- ⚠️ TODO: Input validation (Joi)

## 🐛 Troubleshooting

### `ECONNREFUSED 5432` (PostgreSQL not running)
```bash
docker-compose up postgres
# O instalar PostgreSQL localmente
```

### `ECONNREFUSED 6379` (Redis not running)
```bash
docker-compose up redis
# O: brew install redis && redis-server
```

### `401 Unauthorized` en API
```js
// Verificar token en localStorage
console.log(localStorage.getItem('auth_token'));

// Re-login si es necesario
await apiClient.login(email, password);
```

### Documentos no indexándose
```bash
# Revisar logs del worker Bull
docker-compose logs -f backend

# Verificar queue en Redis Commander
docker run -p 8081:8081 rediscommander/redis-commander \
  --redis-host redis \
  --redis-port 6379
```

## 📈 Next Steps

- [ ] Implementar pgvector para búsqueda semántica
- [ ] Agregar autenticación OAuth (Google, GitHub)
- [ ] Implementar streaming de respuestas (SSE)
- [ ] Agregar soporte para LLMs adicionales (OpenAI, Anthropic)
- [ ] Dashboard de analytics y estadísticas
- [ ] Compartir chats/documentos entre usuarios
- [ ] Backup automático de chats
- [ ] PDF viewer integrado
- [ ] Soporte para más formatos (XLSX, PPT, etc)
- [ ] Mobile app (React Native)

## 📄 Licencia

MIT

## 👨‍💻 Autor

Nazareno - Kimun

---

**Última actualización**: Junio 2026

Para soporte: `gonzaleznazareno@abc.gob.ar`
