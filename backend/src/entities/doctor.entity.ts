import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { MedicalRecord } from './medical-record.entity';
import { Appointment } from './appointment.entity';
import { DoctorAvailability } from './doctor-availability.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 100, nullable: true })
  especialidad: string;

  @Column({ length: 50, nullable: true, unique: true, name: 'cedula_profesional' })
  cedulaProfesional: string;

  @Column({ length: 18, nullable: true, unique: true })
  curp: string;

  @Column({ length: 255, nullable: true, name: 'documento_cedula_path' })
  documentoCedulaPath: string;

  @Column({ length: 120, nullable: true, name: 'documento_cedula_nombre' })
  documentoCedulaNombre: string;

  @Column({ length: 80, nullable: true, name: 'documento_cedula_mime' })
  documentoCedulaMime: string;

  @Column({ type: 'text', nullable: true, name: 'notas_validacion' })
  notasValidacion: string;

  @Column({ type: 'text', nullable: true, name: 'motivo_rechazo' })
  motivoRechazo: string;

  @Column({ name: 'validado_por_admin', default: false })
  validadoPorAdmin: boolean;

  @Column({ type: 'datetime', nullable: true, name: 'fecha_validacion' })
  fechaValidacion: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.doctor, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => MedicalRecord, (record) => record.doctor)
  medicalRecords: MedicalRecord[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => DoctorAvailability, (availability) => availability.doctor)
  availability: DoctorAvailability[];
}
