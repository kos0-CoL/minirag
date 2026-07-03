import Joi from 'joi';

export function validateQuery(req, res, next) {
  const schema = Joi.object({
    chatId: Joi.string().optional(),
    query: Joi.string().min(1).max(5000).required(),
    agente: Joi.string().optional(),
    modelo: Joi.string().optional(),
    k: Joi.number().integer().min(1).max(10).optional(),
    modo: Joi.string().valid('default', 'research', 'creative', 'technical').optional(),
    followUp: Joi.boolean().optional(),
    contexto: Joi.string().optional().allow(''),
    modoRespuesta: Joi.string().valid('quick', 'detailed').optional(),
    historial: Joi.array().items(Joi.string()).optional(),
    instrucciones: Joi.string().optional().allow(''),
    apiKey: Joi.string().optional().allow('')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

export function validateRegistro(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    nombre: Joi.string().min(2).max(100).required(),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .message('Contraseña: mínimo 8 chars, mayúscula, minúscula y número')
      .required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}

export function validateLogin(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}
