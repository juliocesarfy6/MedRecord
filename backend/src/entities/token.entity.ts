import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

export enum TokenStatus {
  ACTIVE = 'activo',
  EXPIRED = 'expirado',
  REVOKED = 'revocado',
}

export enum AccessLevel {
  READ = 'lectura',
  EDIT = 'edicion',
}

@Entity('access_tokens')
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100, name: 'token_code' })
  token: string;

  @Column({ name: 'patient_id' })
  patientId: number;

  @Column({ type: 'enum', enum: AccessLevel, default: AccessLevel.READ, name: 'access_level' })
  nivelAcceso: AccessLevel;

  @Column({ type: 'enum', enum: TokenStatus, default: TokenStatus.ACTIVE })
  estado: TokenStatus;

  @Column({ type: 'datetime', name: 'expires_at' })
  fechaExpiracion: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;
}
