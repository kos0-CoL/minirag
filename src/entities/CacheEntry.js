import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'CacheEntry',
  tableName: 'cache_entries',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    usuarioId: { type: 'uuid' },
    query: { type: 'text' },
    hash: { type: 'varchar', length: 64 },
    respuesta: { type: 'text' },
    documentosUtilizados: { type: 'simple-json', default: '[]' },
    modelo: { type: 'varchar', length: 50 },
    agente: { type: 'varchar', length: 50 },
    hits: { type: 'integer', default: 1 },
    expiresAt: { type: 'datetime' },
    createdAt: { type: 'datetime', createDate: true }
  },
  indices: [
    { name: 'idx_cache_usuario_hash', columns: ['usuarioId', 'hash'] }
  ]
});
