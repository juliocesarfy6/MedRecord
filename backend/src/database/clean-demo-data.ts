import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { User, UserRole, UserStatus } from '../entities/user.entity';

async function cleanDemoData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepo = app.get<Repository<User>>(getRepositoryToken(User));
  const dataSource = userRepo.manager.connection;

  await dataSource.transaction(async (manager) => {
    const adminEmail = 'admin@test.com';
    const hashedPassword = await bcrypt.hash('Admin123*', 12);
    let admin = await manager.getRepository(User).findOne({ where: { email: adminEmail } });

    if (!admin) {
      admin = manager.getRepository(User).create({
        nombre: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });
    } else {
      admin.nombre = 'Administrador';
      admin.password = hashedPassword;
      admin.role = UserRole.ADMIN;
      admin.status = UserStatus.ACTIVE;
    }
    const savedAdmin = await manager.getRepository(User).save(admin);

    await manager.query('SET FOREIGN_KEY_CHECKS = 0');
    await manager.query('DELETE FROM notifications');
    await manager.query('DELETE FROM patient_doctor_links');
    await manager.query('DELETE FROM appointments');
    await manager.query('DELETE FROM doctor_availability');
    await manager.query('DELETE FROM tokens');
    await manager.query('DELETE FROM medical_records');
    await manager.query('DELETE FROM audit_logs');
    await manager.query('DELETE FROM patients');
    await manager.query('DELETE FROM doctors');
    await manager.query('DELETE FROM users WHERE id <> ?', [savedAdmin.id]);
    await manager.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  await app.close();
  console.log('Base limpia. Se conservó admin@test.com / Admin123*');
}

cleanDemoData().catch((error) => {
  console.error('Error limpiando datos:', error);
  process.exit(1);
});
