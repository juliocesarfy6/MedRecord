import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const status = dto.role === UserRole.DOCTOR ? UserStatus.PENDING : UserStatus.ACTIVE;

    const user = this.usersRepository.create({
      nombre: dto.nombre,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || UserRole.PATIENT,
      status,
    });

    const saved = await this.usersRepository.save(user);

    // Auto-create patient profile if role is PATIENT
    if (saved.role === UserRole.PATIENT) {
      const patient = this.patientsRepository.create({ user: saved });
      await this.patientsRepository.save(patient);
    }

    const { password, ...result } = saved;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Cuenta desactivada');
    }

    if (user.status === UserStatus.PENDING) {
      throw new UnauthorizedException('Cuenta pendiente de aprobación por el administrador');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['patient'],
    });
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }
}
