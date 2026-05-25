import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { PatientDoctorLink } from '../entities/patient-doctor-link.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { PatientDoctorLinksController } from './patient-doctor-links.controller';
import { PatientDoctorLinksService } from './patient-doctor-links.service';

@Module({
  imports: [TypeOrmModule.forFeature([PatientDoctorLink, Patient, Doctor]), NotificationsModule],
  controllers: [PatientDoctorLinksController],
  providers: [PatientDoctorLinksService],
  exports: [PatientDoctorLinksService],
})
export class PatientDoctorLinksModule {}
