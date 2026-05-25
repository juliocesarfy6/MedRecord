import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { Token } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Doctor } from '../entities/doctor.entity';
import { PatientDoctorLinksModule } from '../patient-doctor-links/patient-doctor-links.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, Patient, Doctor]),
    NotificationsModule,
    PatientDoctorLinksModule,
  ],
  controllers: [TokensController],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule { }
