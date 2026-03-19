import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';

export enum TokenStatus {
  ACTIVE = 'activo',
  EXPIRED = 'expirado',
  REVOKED = 'revocado',
}

export enum AccessLevel {
  READ = 'lectura',
  FULL = 'completo',
}

@Entity('tokens')
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  token: string;

  @Column({ type: 'enum', enum: AccessLevel, default: AccessLevel.READ })
  nivelAcceso: AccessLevel;

  @Column({ type: 'enum', enum: TokenStatus, default: TokenStatus.ACTIVE })
  estado: TokenStatus;

  @Column({ type: 'timestamp' })
  fechaExpiracion: Date;

  @Column({ nullable: true, length: 255 })
  descripcion: string;

  @ManyToOne(() => Patient, (patient) => patient.tokens)
  @JoinColumn()
  patient: Patient;

  @CreateDateColumn()
  createdAt: Date;
}
