import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Patient } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicalRecord, Patient, Doctor])],
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
