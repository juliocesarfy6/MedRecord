import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { AuditLog } from './audit-log.entity';

export enum UserRole {
  PATIENT = 'paciente',
  DOCTOR = 'medico',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo',
  PENDING = 'pendiente',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nombre: string;

  @Column({ unique: true, length: 150 })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => Patient, (patient) => patient.user, { nullable: true })
  patient: Patient;

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];
}
