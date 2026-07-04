/**
 * Mini RAG Pro - Backend Server
 * Arquitectura: Express + TypeORM + Bull (async jobs) + Redis cache
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createConnection } from 'typeorm';
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

// ============= MIDDLEWARE =============
app.use(helmet({
  contentSecurityPolicy: false, // Esto desactiva temporalmente la restricción de scripts
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://minirag-0zmw.onrender.com", 
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Esto dice: "Si alguien pide algo que no es una API, sírvele el archivo del frontend"


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ============= DATABASE CONNECTION =============
let db;
async function initializeDatabase() {
  const dbType = process.env.DB_TYPE || 'sqlite';
  try {
    const config = dbType === 'postgres' ? {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'mini_rag_pro',
    } : {
      type: 'better-sqlite3',
      database: process.env.SQLITE_PATH || './data/mini-rag.db',
    };

    db = await createConnection({
      ...config,
      entities: [User, Chat, Message, Document, DocumentChunk, Agent, CacheEntry],
      synchronize: true,
      logging: process.env.NODE_ENV === 'development'
    });
    console.log(`✅ Database connected (${dbType})`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// ============= ROUTES =============
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (auth)
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/chats', authMiddleware, chatRoutes);
app.use('/api/documents', authMiddleware, documentRoutes);
app.use('/api/agents', authMiddleware, agentRoutes);
app.use('/api/queries', authMiddleware, queryRoutes);
app.use('/api/models', modelRoutes);
// --- Bloque del Frontend ---
app.use(express.static(path.join(__dirname, 'frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});
// ---------------------------

// --- Manejador de errores al final ---
app.use(errorHandler);
// ============= ERROR HANDLING =============
app.use(errorHandler);

// ============= SERVER STARTUP =============
async function start() {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}`);
      console.log(`🔐 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
