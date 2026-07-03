import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn, Index
} from 'typeorm';
import User from './User.js';
import Message from './Message.js';
import Document from './Document.js';

@Entity('chats')
@Index(['usuarioId', 'createdAt'])
export default class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'varchar', default: 'default' })
  modo: string; // 'default' | 'research' | 'creative' | 'technical'

  @Column({ type: 'integer', default: 3 })
  k: number; // número de chunks a recuperar

  @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
  configuracion: Record<string, any>;

  @Column({ type: 'uuid' })
  usuarioId: string;

  @ManyToOne(() => User, user => user.chats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: User;

  @OneToMany(() => Message, msg => msg.chat, { cascade: true })
  mensajes: Message[];

  @Column('uuid', { array: true, default: () => "'{}'" })
  documentosIds: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
