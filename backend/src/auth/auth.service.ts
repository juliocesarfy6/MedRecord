import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Doctor } from '../entities/doctor.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    private jwtService: JwtService,
    private dataSource: DataSource,
  ) { }
  async register(dto: RegisterDto) {
    this.ensureBirthDateIsValid(dto.fecha_nacimiento);

    const existing = await this.usersRepository.findOne({ where: { email: dto.email }, relations: ['patient'] });
    if (existing) {
      if (existing.role === UserRole.PATIENT && !existing.patient) {
        const patient = this.patientsRepository.create({
          user: existing,
          fechaNacimiento: (dto.fecha_nacimiento || '2000-01-01') as any,
          sexo: dto.sexo || 'otro',
          telefono: dto.telefono,
          direccion: dto.direccion,
          curp: dto.curp,
        });
        await this.patientsRepository.save(patient);
        const { password, ...result } = existing;
        return result;
      }
      throw new ConflictException('El email ya está registrado');
    }

    if ((dto.role || UserRole.PATIENT) === UserRole.PATIENT && dto.curp) {
      const existingCurp = await this.patientsRepository.findOne({ where: { curp: dto.curp } });
      if (existingCurp) {
        throw new ConflictException('La CURP ya está registrada');
      }
    }

    if (dto.role === UserRole.DOCTOR && dto.cedulaProfesional) {
      const existingCedula = await this.doctorsRepository.findOne({ where: { cedulaProfesional: dto.cedulaProfesional } });
      if (existingCedula) {
        throw new ConflictException('La cédula profesional ya está registrada');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const status = dto.role === UserRole.DOCTOR ? UserStatus.PENDING : UserStatus.ACTIVE;

    const saved = await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.getRepository(User);
      const patientRepository = manager.getRepository(Patient);
      const doctorRepository = manager.getRepository(Doctor);

      const user = userRepository.create({
        nombre: dto.nombre,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || UserRole.PATIENT,
        status,
      });

      const savedUser = await userRepository.save(user);

      if (savedUser.role === UserRole.PATIENT) {
        const patient = patientRepository.create({
          user: savedUser,
          fechaNacimiento: dto.fecha_nacimiento as any,
          sexo: dto.sexo,
          telefono: dto.telefono,
          direccion: dto.direccion,
          curp: dto.curp,
        });
        await patientRepository.save(patient);
      }

      if (savedUser.role === UserRole.DOCTOR) {
        const doctor = doctorRepository.create({
          user: savedUser,
          especialidad: dto.especialidad,
          cedulaProfesional: dto.cedulaProfesional,
          validadoPorAdmin: false,
        });
        await doctorRepository.save(doctor);
      }

      return savedUser;
    });

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
      where: { id: +userId },
      relations: ['patient'],
    });
    if (!user) throw new UnauthorizedException();
    const { password, ...result } = user;
    return result;
  }

  private ensureBirthDateIsValid(fechaNacimiento?: string) {
    if (!fechaNacimiento) return;

    const date = new Date(fechaNacimiento);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
      throw new BadRequestException('La fecha de nacimiento no puede estar en el futuro');
    }
  }
}
