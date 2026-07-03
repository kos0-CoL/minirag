import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Chat',
  tableName: 'chats',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    titulo: { type: 'varchar', length: 255 },
    descripcion: { type: 'text', nullable: true },
    modo: { type: 'varchar', default: 'default' },
    k: { type: 'integer', default: 3 },
    configuracion: { type: 'simple-json', default: '{}' },
    usuarioId: { type: 'uuid' },
    documentosIds: { type: 'simple-json', default: '[]' },
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true }
  },
  relations: {
    usuario: { type: 'many-to-one', target: 'User', joinColumn: { name: 'usuarioId' }, onDelete: 'CASCADE' },
    mensajes: { type: 'one-to-many', target: 'Message', inverseSide: 'chat', cascade: true }
  },
  indices: [
    { name: 'idx_chats_usuario', columns: ['usuarioId', 'createdAt'] }
  ]
});
