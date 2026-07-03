import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import Chat from './Chat.js';
import Document from './Document.js';
import Agent from './Agent.js';

@Entity('users')
export default class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'text', nullable: true })
  geminiApiKey: string;

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  preferences: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Chat, chat => chat.usuario)
  chats: Chat[];

  @OneToMany(() => Document, doc => doc.usuario)
  documentos: Document[];

  @OneToMany(() => Agent, agent => agent.usuario)
  agentes: Agent[];
}
