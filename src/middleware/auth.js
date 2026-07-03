import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import User from '../entities/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mini-rag-dev-secret-2026!change';
if (JWT_SECRET.length < 16) {
  console.warn('⚠️ JWT_SECRET demasiado corto. Usar uno de 32+ caracteres en producción.');
}

export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await getRepository(User).findOne({ where: { id: decoded.userId, isActive: true } });

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    req.user = { id: user.id, email: user.email, nombre: user.nombre };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
}
