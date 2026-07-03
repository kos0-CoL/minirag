import { Router } from 'express';
import multer from 'multer';
import { getRepository } from 'typeorm';
import { documentService } from '../../documentService.js';
import Document from '../entities/Document.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const router = Router();

router.post('/upload', upload.single('archivo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

    const metadatos = req.body.metadatos ? JSON.parse(req.body.metadatos) : {};
    const result = await documentService.procesarDocumento(req.file, req.user.id, metadatos);
    res.status(201).json(result);
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const docs = await documentService.obtenerDocumentos(req.user.id);
    res.json(docs);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const repo = getRepository(Document);
    const doc = await repo.findOne({ where: { id: req.params.id, usuarioId: req.user.id } });
    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(doc);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await documentService.eliminarDocumento(req.params.id, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
