import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Agent',
  tableName: 'agents',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    nombre: { type: 'varchar', length: 255 },
    descripcion: { type: 'text' },
    instrucciones: { type: 'text' },
    tipo: { type: 'varchar', default: 'general' },
    usuarioId: { type: 'uuid' },
    configuracionModelo: { type: 'simple-json', default: '{"temperatura":0.7,"topP":0.9}' },
    activo: { type: 'boolean', default: true },
    usoTotal: { type: 'integer', default: 0 },
    createdAt: { type: 'datetime', createDate: true }
  },
  relations: {
    usuario: { type: 'many-to-one', target: 'User', joinColumn: { name: 'usuarioId' }, onDelete: 'CASCADE' }
  }
});
