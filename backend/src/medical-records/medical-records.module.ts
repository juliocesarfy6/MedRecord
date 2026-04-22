import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecord } from '../entities/medical-record.entity'; // 👈 Verifica este nombre
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    // Inyectamos las 3 tablas que vamos a usar
    TypeOrmModule.forFeature([MedicalRecord, Doctor, Patient]),
    AuditModule,
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule { }