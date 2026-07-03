import { Router } from 'express';
import { getRepository } from 'typeorm';
import Agent from '../entities/Agent.js';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion, instrucciones, tipo } = req.body;
    if (!nombre || !instrucciones) {
      return res.status(400).json({ error: 'Nombre e instrucciones requeridos' });
    }

    const repo = getRepository(Agent);
    const agent = repo.create({
      nombre, descripcion, instrucciones,
      tipo: tipo || 'custom',
      usuarioId: req.user.id
    });
    await repo.save(agent);
    res.status(201).json(agent);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const repo = getRepository(Agent);
    const agents = await repo.find({
      where: [{ usuarioId: req.user.id }, { tipo: 'general' }],
      order: { createdAt: 'DESC' }
    });
    res.json(agents);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const repo = getRepository(Agent);
    const agent = await repo.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });
    if (!agent) return res.status(404).json({ error: 'Agente no encontrado' });

    Object.assign(agent, req.body);
    await repo.save(agent);
    res.json(agent);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const repo = getRepository(Agent);
    const agent = await repo.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });
    if (!agent) return res.status(404).json({ error: 'Agente no encontrado' });

    await repo.remove(agent);
    res.json({ message: 'Agente eliminado' });
  } catch (err) { next(err); }
});

export default router;
