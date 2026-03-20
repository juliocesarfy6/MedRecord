import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ unique: true, length: 120 })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Patient, (patient) => patient.user)
  patient: Patient;

  @OneToOne(() => Doctor, (doctor) => doctor.user)
  doctor: Doctor;

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs: AuditLog[];
}
