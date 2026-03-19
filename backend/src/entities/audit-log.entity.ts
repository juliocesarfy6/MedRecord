import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  accion: string;

  @Column({ nullable: true, length: 100 })
  recurso: string;

  @Column({ nullable: true, length: 50 })
  ip: string;

  @Column({ type: 'text', nullable: true })
  detalles: string;

  @ManyToOne(() => User, (user) => user.auditLogs, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  pacienteId: string;

  @CreateDateColumn()
  fecha: Date;
}
