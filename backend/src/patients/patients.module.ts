import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { Patient } from '../entities/patient.entity';
import { AuditModule } from '../audit/audit.module'; // 👈 1. Importar el módulo

@Module({
  imports: [
    TypeOrmModule.forFeature([Patient]),
    AuditModule, // 👈 2. Agregarlo a los imports
  ],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule { }
