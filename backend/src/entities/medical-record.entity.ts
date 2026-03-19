import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { User } from './user.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ length: 500 })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column({ type: 'text', nullable: true })
  tratamiento: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ nullable: true, length: 100 })
  medicamentos: string;

  @ManyToOne(() => Patient, (patient) => patient.medicalRecords)
  @JoinColumn()
  patient: Patient;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn()
  doctor: User;

  @CreateDateColumn()
  createdAt: Date;
}
