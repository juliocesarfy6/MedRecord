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
    const users = await this.usersRepository.find({
      where,
      relations: ['doctor', 'patient'],
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => ({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      doctor: user.doctor ? {
        id: user.doctor.id,
        especialidad: user.doctor.especialidad,
        cedulaProfesional: user.doctor.cedulaProfesional,
        curp: user.doctor.curp,
        validadoPorAdmin: user.doctor.validadoPorAdmin,
        fechaValidacion: user.doctor.fechaValidacion,
        tieneDocumentoCedula: !!user.doctor.documentoCedulaPath,
        documentoCedulaNombre: user.doctor.documentoCedulaNombre,
        notasValidacion: user.doctor.notasValidacion,
        motivoRechazo: user.doctor.motivoRechazo,
      } : null,
      patient: user.patient ? {
        id: user.patient.id,
        curp: user.patient.curp,
      } : null,
    }));
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

  async approveDoctor(id: string, notasValidacion?: string) {
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
    doctor.notasValidacion = notasValidacion?.trim() || doctor.notasValidacion || 'Validado manualmente por administrador.';
    doctor.motivoRechazo = null as any;
    await this.doctorsRepository.save(doctor);

    return savedUser;
  }

  async rejectDoctor(id: string, motivoRechazo?: string) {
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
      doctor.motivoRechazo = motivoRechazo?.trim() || 'Solicitud rechazada por el administrador.';
      await this.doctorsRepository.save(doctor);
    }

    return savedUser;
  }

  async getDoctorDocument(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: +userId },
      relations: ['doctor'],
    });
    if (!user || user.role !== UserRole.DOCTOR || !user.doctor) {
      throw new NotFoundException('Médico no encontrado');
    }
    if (!user.doctor.documentoCedulaPath) {
      throw new NotFoundException('El médico no tiene documento de cédula adjunto');
    }

    return {
      path: user.doctor.documentoCedulaPath,
      originalName: user.doctor.documentoCedulaNombre || 'documento-cedula',
      mime: user.doctor.documentoCedulaMime || 'application/octet-stream',
    };
  }

}
