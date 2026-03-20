import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Patient } from './patient.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'patient_id', nullable: true })
  patientId: number;

  @Column({ length: 150, name: 'action' })
  accion: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  detalles: string;

  @Column({ nullable: true, length: 45, name: 'ip_address' })
  ip: string;

  @CreateDateColumn({ name: 'created_at' })
  fecha: Date;

  @ManyToOne(() => User, (user) => user.auditLogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Patient, (patient) => patient.auditLogs, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
