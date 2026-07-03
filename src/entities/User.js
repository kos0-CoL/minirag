import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    email: { type: 'varchar', length: 255, unique: true },
    nombre: { type: 'varchar', length: 255 },
    passwordHash: { type: 'varchar', length: 255 },
    preferences: { type: 'simple-json', default: '{}' },
    isActive: { type: 'boolean', default: true },
    createdAt: { type: 'datetime', createDate: true },
    updatedAt: { type: 'datetime', updateDate: true }
  },
  relations: {
    chats: { type: 'one-to-many', target: 'Chat', inverseSide: 'usuario' },
    documentos: { type: 'one-to-many', target: 'Document', inverseSide: 'usuario' },
    agentes: { type: 'one-to-many', target: 'Agent', inverseSide: 'usuario' }
  }
});
