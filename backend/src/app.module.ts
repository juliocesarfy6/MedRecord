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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', 'root'),
        database: config.get<string>('DB_NAME', 'historial_medico_db'),
        entities: [User, Patient, Doctor, MedicalRecord, Token, AuditLog],
        synchronize: false, // User provided SQL script
        charset: 'utf8mb4',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UsersModule,
    PatientsModule,
    MedicalRecordsModule,
    TokensModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
