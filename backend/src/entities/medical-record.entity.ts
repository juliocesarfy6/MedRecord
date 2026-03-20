import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id' })
  patientId: number;

  @Column({ name: 'doctor_id', nullable: true })
  doctorId: number;

  @Column({ type: 'datetime', name: 'fecha_consulta' })
  fecha: Date;

  @Column({ type: 'text', name: 'motivo_consulta', nullable: true })
  motivo: string;

  @Column({ type: 'text', nullable: true })
  diagnostico: string;

  @Column({ type: 'text', nullable: true })
  tratamiento: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Patient, (patient) => patient.medicalRecords, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Doctor, (doctor) => doctor.medicalRecords, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}
