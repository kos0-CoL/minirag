import bcrypt from 'bcryptjs';
import { getRepository } from 'typeorm';
import { OAuth2Client } from 'google-auth-library';
import User from '../entities/User.js';
import { generateToken } from '../middleware/auth.js';

const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client();

export class AuthService {
  async register(email, nombre, password) {
    const repo = getRepository(User);
    const exists = await repo.findOne({ where: { email } });
    if (exists) throw Object.assign(new Error('Email ya registrado'), { status: 409 });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = repo.create({ email, nombre, passwordHash });
    await repo.save(user);

    const token = generateToken(user.id);
    return { user: { id: user.id, email: user.email, nombre: user.nombre }, token };
  }

  async login(email, password) {
    const repo = getRepository(User);
    const user = await repo.findOne({ where: { email, isActive: true } });
    if (!user) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 });

    const token = generateToken(user.id);
    return { user: { id: user.id, email: user.email, nombre: user.nombre }, token };
  }

  async getProfile(userId) {
    const repo = getRepository(User);
    const user = await repo.findOne({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

    return { id: user.id, email: user.email, nombre: user.nombre, preferences: user.preferences };
  }

  async updateProfile(userId, data) {
    const repo = getRepository(User);
    const user = await repo.findOne({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 });

    if (data.nombre) user.nombre = data.nombre;
    if (data.preferences) user.preferences = { ...user.preferences, ...data.preferences };

    await repo.save(user);
    return { id: user.id, email: user.email, nombre: user.nombre, preferences: user.preferences };
  }

  async googleAuth(googleToken) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: [clientId],
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw Object.assign(new Error('Token de Google inválido'), { status: 401 });
      }

      const repo = getRepository(User);
      let user = await repo.findOne({ where: { email: payload.email } });

      if (!user) {
        user = repo.create({
          email: payload.email,
          nombre: payload.name || payload.email.split('@')[0],
          passwordHash: '',
          preferences: { googleId: payload.sub, avatar: payload.picture },
        });
        await repo.save(user);
      }

      const token = generateToken(user.id);
      return { user: { id: user.id, email: user.email, nombre: user.nombre }, token };
    } catch (error) {
      console.error('Google auth error:', error.message);
      if (error.message?.includes('audience')) {
        throw Object.assign(new Error('Configuración de Google inválida. Verifica GOOGLE_CLIENT_ID en backend y frontend coinciden.'), { status: 500 });
      }
      throw Object.assign(new Error('Error al verificar token de Google'), { status: 401 });
    }
  }
}

export const authService = new AuthService();
