
# 🏗️ MINI RAG PRO - ARQUITECTURA VISUAL COMPLETA

## Sistema Completo (Alto Nivel)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          🌐 INTERNET / USUARIOS                              │
└──────────────────────────────────┬───────────────────────────────────────────┘
                                   │
                  ┌────────────────┴────────────────┐
                  │                                 │
                  ▼                                 ▼
        ┌──────────────────┐            ┌──────────────────┐
        │  FRONTEND        │            │  MOBILE APP      │
        │  (React/Vite)    │            │  (React Native)  │
        │                  │            │  (Futuro)        │
        │ Port: 3000       │            │                  │
        └────────┬─────────┘            └────────┬─────────┘
                 │                               │
                 │ HTTPS/JSON                    │
                 │                               │
                 └───────────────┬────────────────┘
                                 │
                                 ▼
        ┌──────────────────────────────────────────────────────────┐
        │               🖥️  BACKEND API (Express)                   │
        │                  Port: 5000                               │
        ├──────────────────────────────────────────────────────────┤
        │                                                            │
        │  ┌─────────────────────────────────────────────────────┐ │
        │  │              MIDDLEWARE LAYER                       │ │
        │  ├─────────────────────────────────────────────────────┤ │
        │  │ • JWT Auth        • CORS              • Logging     │ │
        │  │ • Rate Limiting   • Input Validation • Error Handle │ │
        │  └─────────────────────────────────────────────────────┘ │
        │                                                            │
        │  ┌─────────────────────────────────────────────────────┐ │
        │  │            ROUTE HANDLERS                           │ │
        │  ├─────────────────────────────────────────────────────┤ │
        │  │ /auth      /chats      /documents    /agents        │ │
        │  │ /queries   /cache                                   │ │
        │  └─────────────────────────────────────────────────────┘ │
        │                                                            │
        │  ┌─────────────────────────────────────────────────────┐ │
        │  │         SERVICES (Business Logic)                   │ │
        │  ├─────────────────────────────────────────────────────┤ │
        │  │                                                      │ │
        │  │  ┌──────────────────────────────────────────────┐  │ │
        │  │  │ 🔍 QueryService (RAG)                        │  │ │
        │  │  ├──────────────────────────────────────────────┤  │ │
        │  │  │ 1. Retrieval (pgvector search)               │  │ │
        │  │  │ 2. Context Building (concatenate chunks)     │  │ │
        │  │  │ 3. Prompt Engineering (agent instructions)   │  │ │
        │  │  │ 4. Gemini API Call                           │  │ │
        │  │  │ 5. Response Formatting                       │  │ │
        │  │  │ 6. Caching (Redis + DB)                      │  │ │
        │  │  └──────────────────────────────────────────────┘  │ │
        │  │                                                      │ │
        │  │  ┌──────────────────────────────────────────────┐  │ │
        │  │  │ 📄 DocumentService                           │  │ │
        │  │  ├──────────────────────────────────────────────┤  │ │
        │  │  │ • Text extraction (PDF, DOCX, TXT, HTML)    │  │ │
        │  │  │ • Chunking (1000 chars, 200 overlap)        │  │ │
        │  │  │ • Async embedding (Bull queue)              │  │ │
        │  │  └──────────────────────────────────────────────┘  │ │
        │  │                                                      │ │
        │  │  ┌──────────────────────────────────────────────┐  │ │
        │  │  │ 👤 AuthService                              │  │ │
        │  │  │ • Registration & Login (JWT)                 │  │ │
        │  │  │ • Password hashing (bcrypt)                  │  │ │
        │  │  │ • API key encryption                         │  │ │
        │  │  └──────────────────────────────────────────────┘  │ │
        │  │                                                      │ │
        │  │  ┌──────────────────────────────────────────────┐  │ │
        │  │  │ 💬 ChatService                              │  │ │
        │  │  │ • Chat CRUD                                  │  │ │
        │  │  │ • Message persistence                        │  │ │
        │  │  │ • Config management                          │  │ │
        │  │  └──────────────────────────────────────────────┘  │ │
        │  │                                                      │ │
        │  └─────────────────────────────────────────────────────┘ │
        │                                                            │
        └──────────────────────────────────────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 │               │               │
                 ▼               ▼               ▼
        ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
        │ 🐘 PostgreSQL│  │ 🔴 Redis     │  │ 🌐 Gemini API│
        │              │  │              │  │              │
        │ • Users      │  │ • Cache      │  │ • Embedding  │
        │ • Chats      │  │ • Job Queue  │  │ • Generation │
        │ • Messages   │  │ • Sessions   │  │              │
        │ • Documents  │  │              │  │              │
        │ • Chunks     │  │              │  │              │
        │ • Agents     │  │              │  │              │
        │              │  │              │  │              │
        │ Port: 5432   │  │ Port: 6379   │  │ Port: 443    │
        └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Data Flow: Consulta RAG

```
USER INPUT
    │
    │ "¿Qué es Machine Learning?"
    │
    ▼
┌──────────────────────────────────────────────┐
│  Frontend: ChatWindow component              │
│  ├─ Mostrar mensaje del usuario              │
│  ├─ Mostrar loading spinner                  │
│  └─ Llamar apiClient.hacerPregunta()         │
└────────────┬─────────────────────────────────┘
             │
             │ POST /api/queries/ask
             │ {chatId, query, agente, k, modelo}
             │
             ▼
┌──────────────────────────────────────────────┐
│  QueryController.ask()                       │
│  ├─ Validar JWT token                        │
│  ├─ Validar input (Joi schema)               │
│  └─ Llamar queryService.procesarQuery()      │
└────────────┬─────────────────────────────────┘
             │
             ▼
     ┌───────────────────────────────────────┐
     │ 1️⃣  VERIFICAR CACHÉ                   │
     ├───────────────────────────────────────┤
     │ hash = SHA256(query+agente+modelo)    │
     │ redisCache.get(hash)                  │
     │                                       │
     │ ┌─ ¿HIT? ──────────────────────────┐ │
     │ │ Retornar respuesta + {desde      │ │
     │ │ Cache: true}                     │ │
     │ └──────────────────────────────────┘ │
     │                                       │
     │ ┌─ MISS? ──────────────────────────┐ │
     │ │ Continuar...                     │ │
     │ └──────────────────────────────────┘ │
     └────────────┬────────────────────────┘
                  │
                  ▼
     ┌───────────────────────────────────────┐
     │ 2️⃣  RETRIEVAL                         │
     ├───────────────────────────────────────┤
     │ • Obtener embedding del query         │
     │   gemini.embedContent(query)          │
     │   ↓ [embedding vector de 768 dims]   │
     │                                       │
     │ • Buscar en PostgreSQL + pgvector    │
     │   SELECT * FROM document_chunks      │
     │   WHERE similarity > 0.7              │
     │   ORDER BY similarity DESC            │
     │   LIMIT k (3)                         │
     │   ↓ [chunk1, chunk2, chunk3]         │
     │                                       │
     │ • Scoring por relevancia              │
     │   score = cosine_similarity(...)      │
     └────────────┬────────────────────────┘
                  │
                  ▼
     ┌───────────────────────────────────────┐
     │ 3️⃣  CONTEXT BUILDING                  │
     ├───────────────────────────────────────┤
     │ contexto = """                        │
     │ [1] {chunk1_content}                  │
     │ (Fuente: documento1.pdf)              │
     │                                       │
     │ [2] {chunk2_content}                  │
     │ (Fuente: documento2.pdf)              │
     │                                       │
     │ [3] {chunk3_content}                  │
     │ (Fuente: documento3.txt)              │
     │ """                                   │
     └────────────┬────────────────────────┘
                  │
                  ▼
     ┌───────────────────────────────────────┐
     │ 4️⃣  PROMPT ENGINEERING                │
     ├───────────────────────────────────────┤
     │ prompt = """                          │
     │ Sos un asistente "researcher"         │
     │                                       │
     │ CONTEXTO:                             │
     │ [chunks concatenados]                 │
     │                                       │
     │ INSTRUCCIONES:                        │
     │ - Analiza profundamente               │
     │ - Múltiples perspectivas              │
     │ - Cita fuentes                        │
     │ - Modo: research                      │
     │                                       │
     │ PREGUNTA:                             │
     │ ¿Qué es Machine Learning?             │
     │ """                                   │
     └────────────┬────────────────────────┘
                  │
                  ▼
     ┌───────────────────────────────────────┐
     │ 5️⃣  LLAMAR GEMINI API                 │
     ├───────────────────────────────────────┤
     │ POST /v1beta/models/gemini-pro        │
     │     :generateContent                  │
     │                                       │
     │ {                                     │
     │   "contents": [{                      │
     │     "parts": [{"text": prompt}]       │
     │   }],                                 │
     │   "generationConfig": {               │
     │     "temperature": 0.7,               │
     │     "topP": 0.9,                      │
     │     "maxOutputTokens": 2048           │
     │   }                                   │
     │ }                                     │
     │                                       │
     │ ↓ (1-5 segundos)                     │
     │                                       │
     │ Response: {                           │
     │   "candidates": [{                    │
     │     "content": {                      │
     │       "parts": [{                     │
     │         "text": "Machine Learning..." │
     │       }]                              │
     │     }                                 │
     │   }]                                  │
     │ }                                     │
     └────────────┬────────────────────────┘
                  │
                  ▼
     ┌───────────────────────────────────────┐
     │ 6️⃣  FORMATEAR RESPUESTA               │
     ├───────────────────────────────────────┤
     │ markdown → HTML                       │
     │ # Título → <h1>Título</h1>           │
     │ **bold** → <strong>bold</strong>     │
     │ _italic_ → <em>italic</em>           │
     │ `code` → <code>code</code>           │
     │                                       │
     │ respuestaFormateada = """             │
     │ <h2>Machine Learning</h2>             │
     │ <p>Es un subcampo...</p>             │
     │ <h3>Tipos</h3>                        │
     │ <ul><li>Supervised</li>...</ul>      │
     │ """                                   │
     └────────────┬────────────────────────┘
                  │
                  ▼
     ┌───────────────────────────────────────┐
     │ 7️⃣  GUARDAR EN CACHÉ                  │
     ├───────────────────────────────────────┤
     │ • Redis (rápido, expira 7 días)      │
     │   redisCache.set(hash, respuesta,    │
     │     TTL: 604800)                      │
     │                                       │
     │ • PostgreSQL (persistencia)          │
     │   INSERT INTO cache_entries...       │
     │   {usuarioId, hash, query,           │
     │    respuesta, documentosUtilizados}  │
     └────────────┬────────────────────────┘
                  │
                  ▼
     ┌───────────────────────────────────────┐
     │ 8️⃣  GUARDAR EN DB                     │
     ├───────────────────────────────────────┤
     │ • Message usuario:                    │
     │   INSERT INTO messages                │
     │   (chatId, role='user', contenido)   │
     │                                       │
     │ • Message assistant:                  │
     │   INSERT INTO messages                │
     │   (chatId, role='assistant',         │
     │    contenido, documentosUtilizados)  │
     │                                       │
     │ • Update chat:                        │
     │   UPDATE chats SET updatedAt = NOW   │
     └────────────┬────────────────────────┘
                  │
                  ▼
┌──────────────────────────────────────────────┐
│  Response 200 OK                             │
│  {                                           │
│    "messageId": "msg-uuid",                  │
│    "respuesta": "<h2>ML...</h2>",           │
│    "documentosUtilizados": ["doc-1"],       │
│    "desdeCache": false,                      │
│    "tiempoMs": 2340                         │
│  }                                           │
└────────────┬─────────────────────────────────┘
             │
             │ JSON response
             │
             ▼
┌──────────────────────────────────────────────┐
│  Frontend: Renderizar                        │
│  ├─ Mostrar respuesta HTML formateada       │
│  ├─ Mostrar badges de fuentes               │
│  ├─ Mostrar "⚡ Desde caché" si aplica      │
│  ├─ Mostrar "⏱️ 2.3s" de latencia          │
│  └─ Guardar en store (Zustand)              │
└────────────┬─────────────────────────────────┘
             │
             ▼
        👤 USER VE RESPUESTA FORMATEADA
```

---

## Documento Upload Flow

```
USER SELECCIONA ARCHIVO
    │
    ▼
┌──────────────────────────────┐
│ Frontend: DocumentUpload      │
│ ├─ Mostrar form metadatos    │
│ ├─ Validar file size (<50MB) │
│ └─ Enviar FormData           │
└────────────┬────────────────┘
             │
             │ POST /api/documents/upload
             │ FormData {
             │   archivo: File,
             │   chatId: uuid,
             │   metadatos: {autor, fecha, tema}
             │ }
             │
             ▼
┌──────────────────────────────┐
│ DocumentController           │
│ ├─ Validar JWT               │
│ ├─ Validar file              │
│ └─ Llamar documentService    │
└────────────┬────────────────┘
             │
             ▼
     ┌──────────────────────────┐
     │ 1️⃣  Guardar archivo      │
     ├──────────────────────────┤
     │ path = /uploads/          │
     │   {usuarioId}/            │
     │   {timestamp}_{filename}  │
     │                           │
     │ fs.writeFile(...)         │
     └────────────┬──────────────┘
                  │
                  ▼
     ┌──────────────────────────┐
     │ 2️⃣  Crear Document       │
     ├──────────────────────────┤
     │ INSERT INTO documents    │
     │ {nombre, tipo, tamanio,  │
     │  usuarioId, metadatos}   │
     │                          │
     │ documentoId: uuid        │
     └────────────┬──────────────┘
                  │
                  ▼
     ┌──────────────────────────┐
     │ 3️⃣  Extraer texto        │
     ├──────────────────────────┤
     │ if tipo == 'pdf':        │
     │   pdf.parse(buffer)      │
     │ elif tipo == 'docx':     │
     │   docx-parser(buffer)    │
     │ elif tipo == 'txt':      │
     │   buffer.toString()      │
     │ elif tipo == 'html':     │
     │   strip_tags(buffer)     │
     │                          │
     │ texto = "..."            │
     └────────────┬──────────────┘
                  │
                  ▼
     ┌──────────────────────────┐
     │ 4️⃣  Chunking             │
     ├──────────────────────────┤
     │ chunks = []              │
     │ for i = 0 to len(texto): │
     │   chunk = texto[i:      │
     │     i+1000] (overlap 200)│
     │   chunks.push({          │
     │     texto, inicio, fin   │
     │   })                     │
     │                          │
     │ totalChunks = len(chunks)│
     └────────────┬──────────────┘
                  │
                  ▼
     ┌──────────────────────────┐
     │ 5️⃣  Guardar Chunks DB    │
     ├──────────────────────────┤
     │ for each chunk:          │
     │   INSERT INTO            │
     │   document_chunks        │
     │   {documentoId, indice,  │
     │    contenido, inicio,    │
     │    fin}                  │
     └────────────┬──────────────┘
                  │
                  ▼
     ┌──────────────────────────┐
     │ 6️⃣  Encolar Embedding    │
     ├──────────────────────────┤
     │ bull.queue.add({         │
     │   documentoId: uuid,     │
     │   priority: 1 (high)     │
     │ })                       │
     │                          │
     │ Job encolado en Redis    │
     └────────────┬──────────────┘
                  │
                  ▼
┌──────────────────────────────┐
│ Response 202 Accepted        │
│ {                            │
│   "documentoId": "uuid",     │
│   "nombre": "archivo.pdf",   │
│   "chunks": 45,              │
│   "tamanio": 512000,         │
│   "status": "processing"     │
│ }                            │
└────────────┬────────────────┘
             │
             │ Async Job Worker
             ▼ (Bull queue processor)
     ┌──────────────────────────┐
     │ 7️⃣  WORKER: Embedding    │
     ├──────────────────────────┤
     │ for each chunk in doc:   │
     │   embedding =            │
     │   gemini.embed(chunk)    │
     │                          │
     │   UPDATE                 │
     │   document_chunks        │
     │   SET embedding = [...]  │
     │                          │
     │   chunksIndexados++      │
     │                          │
     │ UPDATE documents         │
     │ SET indexado = true      │
     └────────────┬──────────────┘
                  │
                  ▼
┌──────────────────────────────┐
│ Frontend: Notification       │
│ "✅ Documento indexado!"     │
│ Ahora disponible en RAG      │
└──────────────────────────────┘
```

---

## Componentes: Frontend vs Backend

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ChatWindow                  Sidebar                        │
│  ├─ MessageList              ├─ ChatsList                  │
│  │  ├─ MessageBubble         │  ├─ ChatItem               │
│  │  │  ├─ Text HTML          │  │  ├─ Título              │
│  │  │  ├─ Sources Badge      │  │  ├─ Fecha               │
│  │  │  └─ Cache Indicator    │  │  └─ Delete btn          │
│  │  └─ Loading Spinner       │  └─ NewChatButton         │
│  │                            │                            │
│  ├─ InputArea                └─ DocumentsPanel            │
│  │  ├─ Textarea              ├─ DocumentsList            │
│  │  ├─ Send Button           │  ├─ DocumentItem         │
│  │  └─ File Upload           │  │  ├─ Name/Size         │
│  │                            │  │  └─ Delete btn        │
│  │                            │  └─ Upload Form         │
│  └─ Settings                 │                           │
│     ├─ Model Selector        └─ AgentsList             │
│     ├─ K Selector               ├─ AgentItem           │
│     ├─ Mode Selector            ├─ Agent Name         │
│     └─ Theme Toggle             └─ Create Form        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
        ▲
        │ useAppStore (Zustand)
        │ ├─ user, token
        │ ├─ chatActual, chats[]
        │ ├─ documentos[], agentes[]
        │ └─ tema, loading, ...
        │
        │ apiClient (Axios)
        │ ├─ hacerPregunta()
        │ ├─ crearChat()
        │ ├─ cargarDocumento()
        │ └─ crearAgente()
        │
        └─ HTTP/JSON


┌─────────────────────────────────────────────────────────────┐
│                        BACKEND (Express)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  QueryController              ChatController               │
│  ├─ POST /ask                 ├─ POST (create)            │
│  │  └─ queryService           ├─ GET (list)              │
│  │     ├─ retrieval()         ├─ PUT (update)            │
│  │     ├─ contextBuilding()   └─ DELETE (delete)         │
│  │     ├─ promptGen()                                     │
│  │     ├─ callGemini()        DocumentController         │
│  │     └─ format()            ├─ POST /upload            │
│  │                            │  └─ documentService      │
│  └─ GET /cache stats          │     ├─ extractText()    │
│                               │     ├─ chunking()       │
│  AgentController              │     └─ enqueuEmbedding()│
│  ├─ POST (create)             ├─ GET (list)            │
│  ├─ GET (list)                └─ DELETE (delete)       │
│  ├─ PUT (update)                                        │
│  └─ DELETE (delete)           AuthController           │
│                               ├─ POST /register        │
│                               ├─ POST /login           │
│                               └─ POST /logout          │
│                                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico Visual

```
FRONTEND                      BACKEND                    DATA LAYER
─────────────────────────────────────────────────────────────────
React 18                    Node.js 18                 PostgreSQL 15
TypeScript                  Express.js 4               (TypeORM)
Vite                        JWT Auth                   • Users
Zustand Store               (bcrypt)                   • Chats
Axios                       Bull Queue                 • Messages
Tailwind CSS                (Redis)                    • Documents
React Router                                           • Chunks
Lucide Icons                Gemini API                 • Agents
                            (v1beta)                   • Cache Entries

                                                       Redis 7
                                                       (In-Memory)
                                                       • Cache
                                                       • Job Queue
                                                       • Sessions

                                                       File Storage
                                                       • Local FS
                                                       • S3 (opt)
```

---

## Deployment Architecture

```
DEVELOPMENT (Docker Compose)
────────────────────────────────────────
docker-compose.yml
├─ postgres (5432)
├─ redis (6379)
├─ backend (5000)
└─ frontend (3000)


PRODUCTION (Cloud)
────────────────────────────────────────
                  ┌─────────────────┐
                  │   Cloudflare    │
                  │   (CDN + DNS)   │
                  └────────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌─────────┐      ┌──────────┐      ┌──────────┐
    │ Vercel  │      │ Render   │      │ Render   │
    │ S3      │      │ Backend  │      │ Postgres │
    │ (Static)│      │ (Node)   │      │ + Redis  │
    └─────────┘      └──────────┘      └──────────┘
        │                  │                  │
        │ Static HTML/JS   │ Express API      │ Data
        └──────────────────┴──────────────────┘
```

---

*Última actualización: Junio 2026*
*Estado: Arquitectura completada, implementación en progreso*
