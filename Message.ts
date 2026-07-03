import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import Chat from './Chat.js';

@Entity('messages')
export default class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  chatId: string;

  @ManyToOne(() => Chat, chat => chat.mensajes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatId' })
  chat: Chat;

  @Column({ type: 'enum', enum: ['user', 'assistant', 'system'] })
  role: 'user' | 'assistant' | 'system';

  @Column({ type: 'text' })
  contenido: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  metadata: Record<string, any>;

  @Column('uuid', { array: true, default: () => "'{}'" })
  documentosUtilizados: string[];

  @Column({ type: 'boolean', default: false })
  desdeCache: boolean;

  @Column({ type: 'float', nullable: true })
  tiempoRespuesta: number; // en ms

  @CreateDateColumn()
  createdAt: Date;
}
