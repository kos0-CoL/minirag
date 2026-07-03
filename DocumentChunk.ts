import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, Index
} from 'typeorm';
import Document from './Document.js';

@Entity('document_chunks')
@Index(['documentoId', 'indice'])
export default class DocumentChunk {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  documentoId: string;

  @ManyToOne(() => Document, doc => doc.chunks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'documentoId' })
  documento: Document;

  @Column({ type: 'integer' })
  indice: number; // número de chunk dentro del documento

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'integer' })
  inicio: number; // posición inicial en el documento original

  @Column({ type: 'integer' })
  fin: number; // posición final

  @Column('real', { array: true, nullable: true })
  embedding: number[]; // vector de embedding de Gemini

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadatos: Record<string, any>;

  @Column({ type: 'float', nullable: true })
  score: number; // score de similitud cuando se recupera
}
