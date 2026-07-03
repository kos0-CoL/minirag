export default function errorHandler(err, req, res, _next) {
  console.error('Error:', err.message || err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, detalles: err.detalles });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  res.status(500).json({ error: 'Error interno del servidor' });
}
