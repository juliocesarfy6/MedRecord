import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

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
    user.status = UserStatus.ACTIVE;
    return this.usersRepository.save(user);
  }

  async rejectDoctor(id: string) {
    const user = await this.usersRepository.findOne({ where: { id: +id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    user.status = UserStatus.INACTIVE;
    return this.usersRepository.save(user);
  }
}
