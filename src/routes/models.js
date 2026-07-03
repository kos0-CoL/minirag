import { Router } from 'express';
import axios from 'axios';

const router = Router();

router.get('/list', async (req, res, next) => {
  try {
    const { provider, apiKey } = req.query;

    if (provider !== 'GEMINI' || !apiKey) {
      return res.json({ models: [] });
    }

    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { timeout: 5000 }
    );

    const models = (response.data.models || [])
      .filter(m => m.name && m.name.includes('gemini') && m.name.includes('generateContent'))
      .map(m => ({
        id: m.name.split('/').pop(),
        nombre: m.displayName || m.name.split('/').pop(),
        provider: 'GEMINI',
      }));

    res.json({ models });
  } catch (err) {
    if (err && err.response && (err.response.status === 403 || err.response.status === 400)) {
      return res.status(400).json({ error: 'API Key inválida o sin permisos', models: [] });
    }
    res.json({ models: [] });
  }
});

export default router;
