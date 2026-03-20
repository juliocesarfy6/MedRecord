import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { MedicalRecord } from './medical-record.entity';
import { Token } from './token.entity';
import { AuditLog } from './audit-log.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'date', name: 'fecha_nacimiento' })
  fechaNacimiento: Date;

  @Column({ type: 'enum', enum: ['masculino', 'femenino', 'otro'] })
  sexo: string;

  @Column({ nullable: true, length: 20 })
  telefono: string;

  @Column({ nullable: true, length: 255 })
  direccion: string;

  @Column({ nullable: true, length: 18, unique: true })
  curp: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.patient, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => MedicalRecord, (record) => record.patient)
  medicalRecords: MedicalRecord[];

  @OneToMany(() => Token, (token) => token.patient)
  tokens: Token[];

  @OneToMany(() => AuditLog, (log) => log.patient)
  auditLogs: AuditLog[];
}
