import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { TokensModule } from './tokens/tokens.module';
import { AuditModule } from './audit/audit.module';

import { User } from './entities/user.entity';
import { Patient } from './entities/patient.entity';
import { MedicalRecord } from './entities/medical-record.entity';
import { Token } from './entities/token.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Doctor } from './entities/doctor.entity';
import { DoctorsModule } from './doctors/doctors.module';
import { Appointment } from './entities/appointment.entity';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { AppointmentsModule } from './appointments/appointments.module';
import { Notification } from './entities/notification.entity';
import { NotificationsModule } from './notifications/notifications.module';
import { PatientDoctorLink } from './entities/patient-doctor-link.entity';
import { PatientDoctorLinksModule } from './patient-doctor-links/patient-doctor-links.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const syncSchema = config.get<string>('DB_SYNC') === 'true' || config.get('NODE_ENV') === 'development';
        return {
          type: 'mysql',
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get<string>('DB_USERNAME', 'root'),
          password: config.get<string>('DB_PASSWORD', 'root'),
          database: config.get<string>('DB_DATABASE') || config.get<string>('DB_NAME', 'historial_medico_db'),
          entities: [User, Patient, Doctor, MedicalRecord, Token, AuditLog, Appointment, DoctorAvailability, Notification, PatientDoctorLink],
          synchronize: syncSchema,
          charset: 'utf8mb4',
          logging: config.get('NODE_ENV') === 'development',
        };
      },
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    MedicalRecordsModule,
    TokensModule,
    AuditModule,
    DoctorsModule,
    AppointmentsModule,
    NotificationsModule,
    PatientDoctorLinksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
