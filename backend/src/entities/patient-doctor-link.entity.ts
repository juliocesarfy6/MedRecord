import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Doctor } from './doctor.entity';
import { Patient } from './patient.entity';

export enum PatientDoctorLinkStatus {
  PENDING = 'pendiente',
  ACCEPTED = 'aceptada',
  REJECTED = 'rechazada',
}

@Entity('patient_doctor_links')
@Index(['patientId', 'doctorId'], { unique: true })
export class PatientDoctorLink {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'patient_id' })
  patientId: number;

  @Column({ name: 'doctor_id' })
  doctorId: number;

  @Column({ type: 'enum', enum: PatientDoctorLinkStatus, default: PatientDoctorLinkStatus.PENDING })
  status: PatientDoctorLinkStatus;

  @Column({ type: 'text', nullable: true })
  message: string | null;

  @Column({ type: 'text', nullable: true, name: 'response_message' })
  responseMessage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;
}
