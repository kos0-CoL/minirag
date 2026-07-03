/**
 * Seed script - Puebla DB con datos iniciales
 */
import 'dotenv/config';
import { createConnection, getRepository } from 'typeorm';
import Agent from '../src/entities/Agent.js';
import bcrypt from 'bcryptjs';

const predefinedAgents = [
  {
    nombre: 'Asistente General',
    descripcion: 'Asistente RAG versátil para preguntas generales',
    instrucciones: 'Eres un asistente útil que responde preguntas usando los documentos disponibles. Sé claro y conciso.',
    tipo: 'general',
    configuracionModelo: { temperatura: 0.7, topP: 0.9 }
  },
  {
    nombre: 'Investigador',
    descripcion: 'Analiza profundamente temas complejos con múltiples perspectivas',
    instrucciones: 'Eres un investigador académico. Analiza profundamente, proporciona múltiples perspectivas y cita fuentes de los documentos.',
    tipo: 'researcher',
    configuracionModelo: { temperatura: 0.5, topP: 0.95 }
  },
  {
    nombre: 'Escritor Técnico',
    descripcion: 'Responde con precisión técnica y detalles de implementación',
    instrucciones: 'Eres un ingeniero senior. Responde con precisión técnica. Incluye ejemplos de código y detalles de implementación cuando sea relevante.',
    tipo: 'technical',
    configuracionModelo: { temperatura: 0.4, topP: 0.9 }
  }
];

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    const conn = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'mini_rag_pro',
      entities: ['src/entities/*.js'],
      synchronize: true
    });

    const agentRepo = getRepository(Agent);
    for (const agentData of predefinedAgents) {
      const exists = await agentRepo.findOne({ nombre: agentData.nombre, usuarioId: null });
      if (!exists) {
        const agent = agentRepo.create(agentData);
        await agentRepo.save(agent);
        console.log(`  ✅ Agent created: ${agentData.nombre}`);
      } else {
        console.log(`  ⏭️  Agent already exists: ${agentData.nombre}`);
      }
    }

    console.log('✅ Seeding completed');
    await conn.close();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
