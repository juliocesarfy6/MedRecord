import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { MedicalRecord } from './medical-record.entity';

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
}
