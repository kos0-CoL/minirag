import { Router } from 'express';
import { authService } from '../services/authService.js';
import { validateRegistro, validateLogin } from '../middleware/validation.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/registro', validateRegistro, async (req, res, next) => {
  try {
    const { email, nombre, password } = req.body;
    const result = await authService.register(email, nombre, password);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user.id);
    res.json(profile);
  } catch (err) { next(err); }
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Sesión cerrada' });
});

router.post('/google', async (req, res, next) => {
  try {
    const { googleToken } = req.body;
    if (!googleToken) return res.status(400).json({ error: 'Token requerido' });
    const result = await authService.googleAuth(googleToken);
    res.json(result);
  } catch (err) { next(err); }
});

router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const profile = await authService.updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (err) { next(err); }
});

export default router;
