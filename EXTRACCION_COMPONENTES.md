# Extracción de Componentes: HTML Monoárquivo → Backend Modular

## 🎯 Componentes Extraídos del HTML

### 1. GESTIÓN DE CHATS
**HTML (Líneas 500-700)**
```js
class ChatManager {
  // IndexedDB operations
  initDB()           → DB local
  nuevoChat()        → Crea chat en IndexedDB
  cambiarChat()      → Switch entre chats
  agregarMensaje()   → Guardar en IndexedDB
  cargarChats()      → Recuperar historial
  limpiarChat()      → Borrar mensajes
  renderListaChats() → UI lista de chats
}
```

**→ Backend Modular (TypeORM)**
```
ChatService:
  ├─ Chat Entity (DB schema)
  ├─ Message Entity (relación 1-a-N)
  ├─ ChatController
  │  ├─ POST /chats (crear)
  │  ├─ GET /chats (listar)
  │  ├─ GET /chats/:id (detalle)
  │  ├─ PUT /chats/:id (actualizar)
  │  └─ DELETE /chats/:id (eliminar)
  └─ ChatRepository (queries DB)
```

---

### 2. PROCESAMIENTO DE DOCUMENTOS
**HTML (Líneas 800-1100)**
```js
class DocumentManager {
  // File operations
  extraerYAgregar()      → FileReader + text extraction
  procesarDocumento()    → Genera chunks en memoria
  guardarChunks()        → IndexedDB
  obtenerDocumentos()    → Listar docs
  eliminarDocumento()    → Borrar doc
  actualizarUI()         → Render UI
}
```

**→ Backend Modular**
```
DocumentService:
  ├─ Document Entity
  ├─ DocumentChunk Entity
  ├─ DocumentController
  │  ├─ POST /documents/upload (multipart)
  │  ├─ GET /documents (listar)
  │  ├─ DELETE /documents/:id
  │  └─ GET /documents/:id/status
  ├─ TextExtractor (PDF, DOCX, TXT, HTML)
  ├─ ChunkingService (overlap, size)
  ├─ EmbedQueue (Bull job) → Async processing
  └─ StorageService (File FS o S3)
```

---

### 3. INTEGRACIÓN GEMINI API
**HTML (Líneas 1200-1600)**
```js
class APIManager {
  enviarPregunta() {
    // 1. Preparar prompt
    // 2. Llamar Gemini (fetch directo)
    // 3. Formatear respuesta
    // 4. Parsear JSON de respuesta
    // 5. Guardar en cache localStorage
  }
}
```

**→ Backend Modular**
```
QueryService:
  ├─ retrieval()
  │  ├─ Obtener embedding (Gemini API)
  │  ├─ Buscar en pgvector
  │  └─ Ranking por similitud
  ├─ construirContexto()
  │  └─ Concatenar chunks top-K
  ├─ generarPrompt()
  │  ├─ Instrucciones de agente
  │  ├─ Parámetros de modo
  │  ├─ Contexto RAG
  │  └─ Historial (follow-up)
  ├─ llamarGemini()
  │  └─ Axios → API call con retry
  ├─ formatearRespuesta()
  │  └─ Markdown → HTML
  └─ CacheService (Redis)
     ├─ Guardar respuesta
     ├─ TTL 7 días
     └─ Hit counter
```

---

### 4. GESTOR DE CACHÉ
**HTML (Líneas 900-1000)**
```js
class CacheManager {
  init()           → Cargar desde localStorage
  guardar()        → Guardar query + respuesta
  obtener()        → Buscar en cache
  limpiar()        → Borrar entradas
  actualizarUI()   → Mostrar stats
}
```

**→ Backend Modular**
```
CacheService (Redis + DB backup):
  ├─ set(key, value, ttl) → Redis
  ├─ get(key) → Redis
  ├─ hash(query, agente, modelo)
  ├─ CacheEntry Entity (DB para persistencia)
  ├─ Estadísticas (hits, total entries)
  └─ Limpieza automática (expired TTL)
```

---

### 5. GESTOR DE AGENTES
**HTML (Líneas 1050-1150)**
```js
class AgentesManager {
  obtener()     → Array de agentes
  crear()       → Nuevo agente
  actualizar()  → Modificar instrucciones
  render()      → Dropdown UI
  guardar()     → localStorage
}
```

**→ Backend Modular**
```
AgentService:
  ├─ Agent Entity
  ├─ AgentController
  │  ├─ POST /agents (crear)
  │  ├─ GET /agents (listar)
  │  ├─ PUT /agents/:id (actualizar)
  │  └─ DELETE /agents/:id (eliminar)
  ├─ Tipos predefinidos:
  │  ├─ 'general'
  │  ├─ 'researcher'
  │  ├─ 'summarizer'
  │  ├─ 'translator'
  │  ├─ 'coder'
  │  └─ custom
  └─ ConfiguracionModelo (temp, topP, topK)
```

---

### 6. AUTENTICACIÓN & CONFIGURACIÓN
**HTML (Líneas 300-400)**
```js
// API Key management
document.getElementById('apiKey').value
// Guardado en localStorage (¡INSEGURO!)

// Dark mode
loadDarkModePreference()
// localStorage tema

// Parámetros RAG
document.getElementById('kSelect').value
document.getElementById('modelSelect').value
```

**→ Backend Modular**
```
AuthService:
  ├─ register(email, nombre, password)
  ├─ login(email, password) → JWT token
  ├─ logout()
  └─ refreshToken()

UserService:
  ├─ User Entity
  ├─ geminiApiKey (encrypted en DB)
  ├─ preferences (tema, modelo default, k)
  └─ updateProfile()

Middleware:
  ├─ authMiddleware (verify JWT)
  ├─ validateQuery
  ├─ errorHandler
  └─ rateLimiter
```

---

## 📊 Mapeo Línea por Línea (Selección)

| Línea HTML | Funcionalidad | → Backend | Ruta |
|-----------|--------------|----------|------|
| 500-700 | ChatManager | ChatService | `/api/chats` |
| 800-1100 | DocumentManager | DocumentService | `/api/documents` |
| 1050-1150 | AgentesManager | AgentService | `/api/agents` |
| 1200-1600 | APIManager | QueryService | `/api/queries/ask` |
| 900-1000 | CacheManager | CacheService + Redis | `/api/queries/cache` |
| 1650-1750 | Formato HTML | ResponseFormatter | Service |
| 1800-1850 | Funciones globales | Controllers | Routes |
| 1900-1985 | Inicialización | App bootstrap | `server.js` |

---

## 🏗️ Arquitectura Comparativa

### ANTES (Monoárquivo HTML)
```
┌─────────────────────────────┐
│   HTML + CSS + JS (1985 líneas)    │
├─────────────────────────────┤
│ Frontend (DOM)              │
│ + Backend (Fake)            │
│ + Storage (IndexedDB)       │
│ + API calls (Gemini)        │
│ + Authentication (None)     │
└─────────────────────────────┘
        ↓ No escalable
```

### DESPUÉS (Separado)
```
┌───────────────────────┐         ┌───────────────────────────┐
│   Frontend React      │         │   Backend Node/Express    │
│ ├─ Components         │         │ ├─ Services               │
│ ├─ Store (Zustand)    │   ←→    │ ├─ Controllers            │
│ ├─ Hooks              │ HTTPS   │ ├─ Routes                 │
│ └─ Pages              │         │ ├─ Middleware             │
└───────────────────────┘         │ └─ Jobs (Bull)            │
                                  └───────────────────────────┘
        ↓ Escalable y mantenible  ↓
   ┌────────────────────────────────────┐
   │ PostgreSQL + Redis + File Storage  │
   └────────────────────────────────────┘
```

---

## 📦 Archivos Generados en Este Proyecto

### Backend
```
✅ server.js                    - Punto de entrada
✅ package.json                 - Dependencias
✅ .env.example                 - Variables de configuración
✅ Dockerfile                   - Containerización
✅ docker-compose.yml           - Orquestación

src/
  ✅ entities/User.ts           - Schema usuario
  ✅ entities/Chat.ts           - Schema chat
  ✅ entities/Message.ts        - Schema mensajes
  ✅ entities/Document.ts       - Schema documentos
  ✅ entities/DocumentChunk.ts  - Schema chunks
  ✅ entities/Agent.ts          - Schema agentes
  ✅ entities/CacheEntry.ts     - Schema caché
  
  ✅ routes/queries.js          - Endpoint RAG principal
  ✅ services/queryService.js   - Lógica de retrieval + Gemini
  ✅ services/documentService.js - Procesamiento de archivos
```

### Frontend
```
✅ package.json                 - Dependencias React
✅ STRUCTURE.md                 - Árbol de componentes
✅ store/useAppStore.ts        - Estado global (Zustand)
✅ services/apiClient.ts       - Cliente HTTP centralizado
```

### Documentación
```
✅ README.md                    - Guía de uso y setup
✅ ANALISIS_COMPLETO.md        - Análisis arquitectónico + DB schema + API
```

---

## 🎓 Aprendizajes Clave

### Monoárquivo HTML
**Ventajas:**
- Fácil de iterar
- Cero setup
- Ideal para prototipos

**Desventajas:**
- Código monolítico (1985 líneas)
- Sin autenticación real
- API key visible en client
- No escalable
- Difícil de mantener

### Arquitectura Separada
**Ventajas:**
- Separación de responsabilidades
- Fácil de testear
- Seguridad mejorada
- Escalable
- Multi-tenant

**Desventajas:**
- Más complejidad inicial
- Requiere DevOps
- Más recursos en deploy

---

## 🚀 Próximos Pasos

1. **Implementar componentes React** (usar estructura en `STRUCTURE.md`)
2. **Completar servicios backend** (DocumentService, QueryService están 80% listos)
3. **Crear middleware de auth** y validación
4. **Setup PostgreSQL** con TypeORM
5. **Configurar Redis** para caché y jobs
6. **Agregar pgvector** para búsqueda semántica real
7. **Testing** (Jest + Supertest)
8. **Deployment** (Docker → Render/Railway)

---

**Estado**: ✅ Análisis completado | 🔨 Backend 50% | ⚛️ Frontend 30% | 📦 Deployment 20%
