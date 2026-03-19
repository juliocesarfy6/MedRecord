import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { MedicalRecord } from './medical-record.entity';
import { Token } from './token.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, length: 20 })
  curp: string;

  @Column({ type: 'date', nullable: true })
  fechaNacimiento: Date;

  @Column({ nullable: true, length: 10 })
  sexo: string;

  @Column({ nullable: true, length: 20 })
  telefono: string;

  @Column({ nullable: true, length: 255 })
  direccion: string;

  @Column({ nullable: true, length: 30 })
  grupoSanguineo: string;

  @Column({ type: 'text', nullable: true })
  alergias: string;

  @OneToOne(() => User, (user) => user.patient)
  @JoinColumn()
  user: User;

  @OneToMany(() => MedicalRecord, (record) => record.patient)
  medicalRecords: MedicalRecord[];

  @OneToMany(() => Token, (token) => token.patient)
  tokens: Token[];
}
