import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { User, UserRole, UserStatus } from '../entities/user.entity';

async function ensureAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));

  const email = process.env.ADMIN_EMAIL || 'admin@test.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin123*';
  const hashedPassword = await bcrypt.hash(password, 12);

  let admin = await userRepo.findOne({ where: { email } });

  if (!admin) {
    admin = userRepo.create({
      nombre: 'Administrador',
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });
  } else {
    admin.nombre = admin.nombre || 'Administrador';
    admin.password = hashedPassword;
    admin.role = UserRole.ADMIN;
    admin.status = UserStatus.ACTIVE;
  }

  await userRepo.save(admin);
  await app.close();

  console.log(`Admin listo: ${email}`);
}

ensureAdmin().catch((error) => {
  console.error('Error creando admin:', error);
  process.exit(1);
});
