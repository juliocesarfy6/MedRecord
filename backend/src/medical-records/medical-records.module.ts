import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecord } from '../entities/medical-record.entity'; // 👈 Verifica este nombre
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AuditModule } from '../audit/audit.module';
import { TokensModule } from '../tokens/tokens.module';
import { PatientDoctorLinksModule } from '../patient-doctor-links/patient-doctor-links.module';

@Module({
  imports: [
    // Inyectamos las 3 tablas que vamos a usar
    TypeOrmModule.forFeature([MedicalRecord, Doctor, Patient]),
    AuditModule,
    TokensModule,
    PatientDoctorLinksModule,
  ],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule { }
