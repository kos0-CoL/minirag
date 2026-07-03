import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'Document',
  tableName: 'documents',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    nombre: { type: 'varchar', length: 255 },
    tipo: { type: 'varchar', length: 50 },
    urlAlmacenamiento: { type: 'text' },
    tamanio: { type: 'integer' },
    usuarioId: { type: 'uuid' },
    metadatos: { type: 'simple-json', default: '{}' },
    totalChunks: { type: 'integer', default: 0 },
    chunksIndexados: { type: 'integer', default: 0 },
    indexado: { type: 'boolean', default: false },
    createdAt: { type: 'datetime', createDate: true },
    indexadoAt: { type: 'datetime', nullable: true }
  },
  relations: {
    usuario: { type: 'many-to-one', target: 'User', joinColumn: { name: 'usuarioId' }, onDelete: 'CASCADE' },
    chunks: { type: 'one-to-many', target: 'DocumentChunk', inverseSide: 'documento', cascade: true }
  },
  indices: [
    { name: 'idx_documents_usuario', columns: ['usuarioId', 'createdAt'] }
  ]
});
