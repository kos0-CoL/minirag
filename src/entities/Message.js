import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Message',
  tableName: 'messages',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    chatId: { type: 'uuid' },
    role: { type: 'varchar', length: 20 },
    contenido: { type: 'text' },
    metadata: { type: 'simple-json', default: '{}' },
    documentosUtilizados: { type: 'simple-json', default: '[]' },
    desdeCache: { type: 'boolean', default: false },
    tiempoRespuesta: { type: 'float', nullable: true },
    createdAt: { type: 'datetime', createDate: true }
  },
  relations: {
    chat: { type: 'many-to-one', target: 'Chat', joinColumn: { name: 'chatId' }, onDelete: 'CASCADE' }
  },
  indices: [
    { name: 'idx_messages_chat', columns: ['chatId', 'createdAt'] }
  ]
});
