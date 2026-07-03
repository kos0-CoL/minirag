import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index
} from 'typeorm';
import User from './User.js';
import DocumentChunk from './DocumentChunk.js';

@Entity('documents')
@Index(['usuarioId', 'createdAt'])
export default class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  tipo: string; // 'pdf', 'txt', 'docx', 'html', etc

  @Column({ type: 'text' })
  urlAlmacenamiento: string; // S3, GCS, etc

  @Column({ type: 'integer' })
  tamanio: number; // en bytes

  @Column({ type: 'uuid' })
  usuarioId: string;

  @ManyToOne(() => User, user => user.documentos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @OneToMany(() => DocumentChunk, chunk => chunk.documento, { cascade: true })
  chunks: DocumentChunk[];

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadatos: {
    autor?: string;
    fecha?: string;
    tema?: string;
    idioma?: string;
  };

  @Column({ type: 'integer', default: 0 })
  totalChunks: number;

  @Column({ type: 'integer', default: 0 })
  chunksIndexados: number;

  @Column({ type: 'boolean', default: false })
  indexado: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  indexadoAt: Date;
}
