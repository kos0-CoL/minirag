import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index
} from 'typeorm';

@Entity('cache_entries')
@Index(['usuarioId', 'hash'])
export default class CacheEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuarioId: string;

  @Column({ type: 'varchar', length: 64 })
  hash: string; // SHA256 del query para búsquedas rápidas

  @Column({ type: 'text' })
  query: string;

  @Column({ type: 'text' })
  respuesta: string;

  @Column('uuid', { array: true, default: () => "'{}'" })
  documentosUtilizados: string[];

  @Column({ type: 'varchar', length: 50 })
  modelo: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  agente: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP + INTERVAL \'7 days\'' })
  expiresAt: Date;

  @Column({ type: 'integer', default: 1 })
  hits: number; // cuántas veces se usó
}
