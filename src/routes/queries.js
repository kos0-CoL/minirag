import crypto from 'crypto';
import { Router } from 'express';
import { getRepository } from 'typeorm';
import Chat from '../entities/Chat.js';
import Message from '../entities/Message.js';
import CacheEntry from '../entities/CacheEntry.js';
import { queryService } from '../../queryService.js';
import { validateQuery } from '../middleware/validation.js';

const router = Router();

router.post('/ask', validateQuery, async (req, res, next) => {
  try {
    const { chatId, query, agente, instrucciones, modelo, k = 3, modo = 'default', followUp = false, contexto, modoRespuesta, historial, apiKey } = req.body;
    const usuarioId = req.user.id;

    const chatRepo = getRepository(Chat);
    let chat = null;
    if (chatId) {
      chat = await chatRepo.findOne({ where: { id: chatId, usuarioId } });
    }

    const cacheRepo = getRepository(CacheEntry);
    const cacheHash = queryService.hashQuery(query, agente, modelo);
    const cached = await cacheRepo.findOne({ where: { usuarioId, hash: cacheHash } });

    let result, desdeCache = false;
    if (cached && new Date() < cached.expiresAt) {
      result = {
        respuesta: cached.respuesta,
        documentosUtilizados: cached.documentosUtilizados || [],
        desdeCache: true
      };
      cached.hits += 1;
      await cacheRepo.save(cached);
      desdeCache = true;
    } else {
      result = await queryService.procesarQuery(query, chat, usuarioId, {
        agente, modelo, k, modo,
        apiKey: apiKey || process.env.GEMINI_API_KEY,
        contexto, modoRespuesta, historial, followUp, instrucciones
      });

      const ttl = 24 * 60 * 60 * 1000;
      const cacheEntry = cacheRepo.create({
        usuarioId, query, hash: cacheHash,
        respuesta: result.respuesta,
        documentosUtilizados: result.documentosUtilizados || [],
        modelo, agente,
        expiresAt: new Date(Date.now() + ttl)
      });
      await cacheRepo.save(cacheEntry);
    }

    const msgRepo = getRepository(Message);
    if (chat) {
      const userMsg = msgRepo.create({ chatId, role: 'user', contenido: query, metadata: { modo, k, followUp } });
      await msgRepo.save(userMsg);

      const assistantMsg = msgRepo.create({
        chatId, role: 'assistant', contenido: result.respuesta,
        documentosUtilizados: result.documentosUtilizados || [],
        desdeCache, tiempoRespuesta: result.tiempoMs || 0
      });
      await msgRepo.save(assistantMsg);

      chat.updatedAt = new Date();
      await chatRepo.save(chat);
    }

    res.json({
      messageId: crypto.randomUUID(), respuesta: result.respuesta,
      documentosUtilizados: result.documentosUtilizados || [],
      desdeCache, tiempoMs: result.tiempoMs || 0,
      rechazado: result.rechazado || false
    });
  } catch (error) { next(error); }
});

router.get('/cache', async (req, res, next) => {
  try {
    const usuarioId = req.user.id;
    const cacheRepo = getRepository(CacheEntry);
    const stats = {
      total: await cacheRepo.count({ where: { usuarioId } }),
      entries: await cacheRepo.find({
        where: { usuarioId },
        order: { hits: 'DESC' },
        take: 20
      })
    };
    res.json(stats);
  } catch (error) { next(error); }
});

router.delete('/cache/:id', async (req, res, next) => {
  try {
    const cacheRepo = getRepository(CacheEntry);
    const entry = await cacheRepo.findOne({ where: { id: req.params.id } });
    if (!entry || entry.usuarioId !== req.user.id) {
      return res.status(404).json({ error: 'No encontrado' });
    }
    await cacheRepo.remove(entry);
    res.json({ message: 'Caché eliminado' });
  } catch (error) { next(error); }
});

export default router;
