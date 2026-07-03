import { getRepository } from 'typeorm';
import Chat from '../entities/Chat.js';

export class ChatService {
  async create(usuarioId, titulo, config = {}) {
    const repo = getRepository(Chat);
    const chat = repo.create({
      titulo,
      usuarioId,
      modo: config.modo || 'default',
      k: config.k || 3,
      descripcion: config.descripcion || ''
    });
    return await repo.save(chat);
  }

  async getAll(usuarioId) {
    return await getRepository(Chat).find({
      where: { usuarioId },
      order: { updatedAt: 'DESC' },
      take: 50
    });
  }

  async getById(chatId, usuarioId) {
    const chat = await getRepository(Chat).findOne({
      where: { id: chatId, usuarioId },
      relations: ['mensajes']
    });
    if (!chat) throw Object.assign(new Error('Chat no encontrado'), { status: 404 });
    return chat;
  }

  async update(chatId, usuarioId, datos) {
    const repo = getRepository(Chat);
    const chat = await repo.findOne({ where: { id: chatId, usuarioId } });
    if (!chat) throw Object.assign(new Error('Chat no encontrado'), { status: 404 });

    Object.assign(chat, datos);
    chat.updatedAt = new Date();
    return await repo.save(chat);
  }

  async delete(chatId, usuarioId) {
    const repo = getRepository(Chat);
    const chat = await repo.findOne({ where: { id: chatId, usuarioId } });
    if (!chat) throw Object.assign(new Error('Chat no encontrado'), { status: 404 });

    await repo.remove(chat);
    return { message: 'Chat eliminado' };
  }
}

export const chatService = new ChatService();
