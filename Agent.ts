import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import User from './User.js';

@Entity('agents')
export default class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'text' })
  instrucciones: string;

  @Column({ type: 'varchar', default: 'general' })
  tipo: string; // 'general', 'researcher', 'summarizer', 'translator', 'coder', custom

  @Column({ type: 'uuid' })
  usuarioId: string;

  @ManyToOne(() => User, user => user.agentes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @Column({ type: 'jsonb', default: () => "'{\"temperatura\": 0.7, \"topP\": 0.9}'::jsonb" })
  configuracionModelo: {
    temperatura?: number;
    topP?: number;
    maxOutputTokens?: number;
    topK?: number;
  };

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @Column({ type: 'integer', default: 0 })
  usoTotal: number;

  @CreateDateColumn()
  createdAt: Date;
}
