import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 12, unique: true })
  pin: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @Index()
  @Column({ type: 'int', name: 'used_by_user_id', nullable: true })
  usedByUserId: number | null;

  @Index()
  @Column({ type: 'int', name: 'doctor_id', nullable: true })
  doctorId: number | null;

  @Column({ type: 'datetime', nullable: true })
  revokedAt: Date | null;

  @Column({ nullable: true })
  nivelAcceso: string;

  @Column({ nullable: true })
  descripcion: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // El token otorga acceso al expediente del paciente
  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Doctor, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor | null;
}
