import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const patientRepo = app.get<Repository<Patient>>(getRepositoryToken(Patient));

  const users = [
    {
      nombre: 'Paciente Demo',
      email: 'paciente@test.com',
      password: 'Paciente123*',
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
    },
    {
      nombre: 'Dr. Médico Demo',
      email: 'medico@test.com',
      password: 'Medico123*',
      role: UserRole.DOCTOR,
      status: UserStatus.ACTIVE,
    },
    {
      nombre: 'Administrador',
      email: 'admin@test.com',
      password: 'Admin123*',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  ];

  for (const userData of users) {
    const existing = await userRepo.findOne({ where: { email: userData.email } });
    if (existing) {
      console.log(`✅ User already exists: ${userData.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = userRepo.create({ ...userData, password: hashedPassword });
    const saved = await userRepo.save(user);
    console.log(`✅ Created user: ${saved.email} (${saved.role})`);

    if (saved.role === UserRole.PATIENT) {
      const patient = patientRepo.create({
        user: saved,
        sexo: 'masculino',
        telefono: '555-1234',
        curp: 'PADM800101HDFXXX01',
        direccion: 'CDMX, México',
        fechaNacimiento: new Date('1980-01-01'),
      });
      await patientRepo.save(patient);
      console.log(`✅ Created patient profile for: ${saved.email}`);
    }
  }

  await app.close();
  console.log('🌱 Seed completed successfully!');
}

seed().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
