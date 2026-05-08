import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
  ) { }

  async findAll(role?: UserRole) {
    const where: any = {};
    if (role) where.role = role;
    return this.usersRepository.find({ where, select: ['id', 'nombre', 'email', 'role', 'status', 'createdAt'] });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id: +id }, select: ['id', 'nombre', 'email', 'role', 'status', 'createdAt'] });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async changeRole(id: string, role: UserRole) {
    const user = await this.usersRepository.findOne({ where: { id: +id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.role = role;
    return this.usersRepository.save(user);
  }

  async toggleStatus(id: string) {
    const user = await this.usersRepository.findOne({ where: { id: +id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.status = user.status === UserStatus.ACTIVE ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    return this.usersRepository.save(user);
  }

  async approveDoctor(id: string) {
    const user = await this.usersRepository.findOne({ where: { id: +id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.role !== UserRole.DOCTOR) {
      throw new BadRequestException('Solo se pueden aprobar usuarios médicos');
    }

    user.status = UserStatus.ACTIVE;
    const savedUser = await this.usersRepository.save(user);

    let doctor = await this.doctorsRepository.findOne({ where: { userId: user.id } });
    if (!doctor) {
      doctor = this.doctorsRepository.create({ userId: user.id });
    }
    doctor.validadoPorAdmin = true;
    doctor.fechaValidacion = new Date();
    await this.doctorsRepository.save(doctor);

    return savedUser;
  }

  async rejectDoctor(id: string) {
    const user = await this.usersRepository.findOne({ where: { id: +id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.role !== UserRole.DOCTOR) {
      throw new BadRequestException('Solo se pueden rechazar usuarios médicos');
    }

    user.status = UserStatus.INACTIVE;
    const savedUser = await this.usersRepository.save(user);

    const doctor = await this.doctorsRepository.findOne({ where: { userId: user.id } });
    if (doctor) {
      doctor.validadoPorAdmin = false;
      doctor.fechaValidacion = null as any;
      await this.doctorsRepository.save(doctor);
    }

    return savedUser;
  }


}
