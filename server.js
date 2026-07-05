/**
 * Mini RAG Pro - Backend Server
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createConnection } from 'typeorm';
// ... (tus importaciones de entidades y rutas se mantienen igual)
import User from './src/entities/User.js';
import Chat from './src/entities/Chat.js';
import Message from './src/entities/Message.js';
import Document from './src/entities/Document.js';
import DocumentChunk from './src/entities/DocumentChunk.js';
import Agent from './src/entities/Agent.js';
import CacheEntry from './src/entities/CacheEntry.js';
import authRoutes from './src/routes/auth.js';
import chatRoutes from './src/routes/chats.js';
import documentRoutes from './src/routes/documents.js';
import agentRoutes from './src/routes/agents.js';
import queryRoutes from './src/routes/queries.js';
import modelRoutes from './src/routes/models.js';
import { authMiddleware } from './src/middleware/auth.js';
import errorHandler from './src/middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============= CORS CONFIGURATION =============
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',  // Desarrollo local
].filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/api/', limiter);

// ============= DATABASE CONNECTION =============
// ... (tu función initializeDatabase se mantiene igual)
let db;
async function initializeDatabase() {
  const dbType = process.env.DB_TYPE || 'sqlite';
  try {
    const config = dbType === 'postgres' ? {
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    } : {
      type: 'better-sqlite3',
      database: process.env.SQLITE_PATH || './data/mini-rag.db',
    };
    db = await createConnection({
      ...config,
      entities: [User, Chat, Message, Document, DocumentChunk, Agent, CacheEntry],
      synchronize: true,
    });
    console.log(`✅ Database connected`);
  } catch (error) { process.exit(1); }
}

// ============= ROUTES =============
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/chats', authMiddleware, chatRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
app.use('/api/agents', authMiddleware, agentRoutes);
app.use('/api/queries', authMiddleware, queryRoutes);
app.use('/api/models', modelRoutes);

// ============= FRONTEND & STATIC FILES (SOLO AL FINAL) =============
const frontendPath = path.join(__dirname, 'frontend/dist');
app.use(express.static(frontendPath, {
  index: false,  // No servir index.html automáticamente
  extensions: ['js', 'css', 'html']  // Extensiones permitidas
}));

// Servir index.html para rutas de la SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ============= ERROR HANDLING =============
app.use(errorHandler);

// ============= STARTUP =============
async function start() {
  await initializeDatabase();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
start();

export default app;
