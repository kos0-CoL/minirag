import { EntitySchema } from 'typeorm';

export default new EntitySchema({
  name: 'DocumentChunk',
  tableName: 'document_chunks',
  columns: {
    id: { type: 'uuid', primary: true, generated: 'uuid' },
    documentoId: { type: 'uuid' },
    indice: { type: 'integer' },
    contenido: { type: 'text' },
    inicio: { type: 'integer' },
    fin: { type: 'integer' },
    embedding: { type: 'simple-json', nullable: true },
    metadatos: { type: 'simple-json', default: '{}' },
    createdAt: { type: 'datetime', createDate: true }
  },
  relations: {
    documento: { type: 'many-to-one', target: 'Document', joinColumn: { name: 'documentoId' }, onDelete: 'CASCADE' }
  },
  indices: [
    { name: 'idx_chunks_documento', columns: ['documentoId', 'indice'] }
  ]
});
