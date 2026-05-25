import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from '../audit/audit.module';
import { Appointment } from '../entities/appointment.entity';
import { DoctorAvailability } from '../entities/doctor-availability.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AvailabilityController } from './availability.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PatientDoctorLinksModule } from '../patient-doctor-links/patient-doctor-links.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, DoctorAvailability, Patient, Doctor]),
    AuditModule,
    NotificationsModule,
    PatientDoctorLinksModule,
  ],
  controllers: [AppointmentsController, AvailabilityController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
