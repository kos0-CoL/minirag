/**
 * Migration script - Sincroniza esquema de base de datos
 */
import 'dotenv/config';
import { createConnection } from 'typeorm';

async function migrate() {
  console.log('🔄 Running database migrations...');

  try {
    const conn = await createConnection({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'mini_rag_pro',
      entities: ['src/entities/*.js'],
      synchronize: true,
      logging: true
    });

    console.log('✅ Migrations completed successfully');
    await conn.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
