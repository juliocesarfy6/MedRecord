import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
// IMPORTANTE: Ajusta las rutas a tus entidades y módulo de auditoría según tu proyecto
import { Doctor } from '../entities/doctor.entity';
import { AuditModule } from '../audit/audit.module';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, User, Patient]),
    AuditModule,
  ],
  controllers: [DoctorsController],
  providers: [DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule { }
