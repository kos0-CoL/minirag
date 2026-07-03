import { Router } from 'express';
import { chatService } from '../services/chatService.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { titulo, ...config } = req.body;
    if (!titulo) return res.status(400).json({ error: 'Título requerido' });
    const chat = await chatService.create(req.user.id, titulo, config);
    res.status(201).json(chat);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const chats = await chatService.getAll(req.user.id);
    res.json(chats);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const chat = await chatService.getById(req.params.id, req.user.id);
    res.json(chat);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const chat = await chatService.update(req.params.id, req.user.id, req.body);
    res.json(chat);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await chatService.delete(req.params.id, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
