-- Mini RAG Pro - Database Initialization
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  preferences JSONB DEFAULT '{}',
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  modo VARCHAR(50) DEFAULT 'default',
  k INTEGER DEFAULT 3,
  configuracion JSONB DEFAULT '{}',
  usuarioId UUID REFERENCES users(id) ON DELETE CASCADE,
  documentosIds TEXT[] DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chats_usuario ON chats(usuarioId, createdAt);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatId UUID REFERENCES chats(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  contenido TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  documentosUtilizados TEXT[] DEFAULT '{}',
  desdeCache BOOLEAN DEFAULT false,
  tiempoRespuesta FLOAT,
  createdAt TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chatId, createdAt);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  urlAlmacenamiento TEXT NOT NULL,
  tamanio INTEGER NOT NULL,
  usuarioId UUID REFERENCES users(id) ON DELETE CASCADE,
  metadatos JSONB DEFAULT '{}',
  totalChunks INTEGER DEFAULT 0,
  chunksIndexados INTEGER DEFAULT 0,
  indexado BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  indexadoAt TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_usuario ON documents(usuarioId, createdAt);

CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  documentoId UUID REFERENCES documents(id) ON DELETE CASCADE,
  indice INTEGER NOT NULL,
  contenido TEXT NOT NULL,
  inicio INTEGER NOT NULL,
  fin INTEGER NOT NULL,
  embedding FLOAT[],
  metadatos JSONB DEFAULT '{}',
  createdAt TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chunks_documento ON document_chunks(documentoId, indice);

CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  instrucciones TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'general',
  usuarioId UUID REFERENCES users(id) ON DELETE CASCADE,
  configuracionModelo JSONB DEFAULT '{"temperatura":0.7,"topP":0.9}',
  activo BOOLEAN DEFAULT true,
  usoTotal INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cache_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuarioId UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  hash VARCHAR(64) NOT NULL,
  respuesta TEXT NOT NULL,
  documentosUtilizados TEXT[] DEFAULT '{}',
  modelo VARCHAR(50),
  agente VARCHAR(50),
  hits INTEGER DEFAULT 1,
  expiresAt TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cache_usuario_hash ON cache_entries(usuarioId, hash);

-- Seed agents por defecto
INSERT INTO agents (nombre, descripcion, instrucciones, tipo, usuarioId) VALUES
  ('Asistente General', 'Asistente RAG versátil para preguntas generales', 'Eres un asistente útil que responde preguntas usando los documentos disponibles. Sé claro y conciso.', 'general', NULL),
  ('Investigador', 'Analiza profundamente temas complejos con múltiples perspectivas', 'Eres un investigador académico. Analiza profundamente, proporciona múltiples perspectivas y cita fuentes de los documentos.', 'researcher', NULL),
  ('Escritor Técnico', 'Responde con precisión técnica y detalles de implementación', 'Eres un ingeniero senior. Responde con precisión técnica. Incluye ejemplos de código y detalles de implementación cuando sea relevante.', 'technical', NULL)
ON CONFLICT DO NOTHING;
