import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { NotificationType } from '../entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { Doctor } from '../entities/doctor.entity';
import { UserStatus } from '../entities/user.entity';
import { PatientDoctorLinksService } from '../patient-doctor-links/patient-doctor-links.service';

type TokenEstado = 'activo' | 'usado' | 'expirado' | 'revocado';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token) private tokensRepository: Repository<Token>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    @InjectRepository(Doctor) private doctorsRepository: Repository<Doctor>,
    private notificationsService: NotificationsService,
    private linksService: PatientDoctorLinksService,
  ) { }

  // 1. Un Paciente genera el Token
  async generateToken(userId: number, data: GenerateTokenDto) {
    const patient = await this.patientRepository.findOne({ where: { userId }, relations: ['user'] });
    if (!patient) throw new NotFoundException('Paciente no encontrado');
    const doctor = await this.doctorsRepository.findOne({
      where: { id: data.doctorId },
      relations: ['user'],
    });
    if (!doctor || !doctor.validadoPorAdmin || doctor.user?.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('Selecciona un médico aprobado y activo');
    }
    await this.linksService.ensureAcceptedLink(patient.id, doctor.id);

    const horasExpiracion = data.horasExpiracion || 24;

    const pin = await this.generateUniquePin();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + horasExpiracion);

    const newToken = this.tokensRepository.create({
      pin,
      expiresAt,
      isUsed: false,
      usedByUserId: null,
      doctorId: doctor.id,
      revokedAt: null,
      nivelAcceso: data.nivelAcceso || 'lectura',
      descripcion: data.descripcion || '',
      patient,
    });

    const saved = await this.tokensRepository.save(newToken);
    saved.doctor = doctor;
    await this.notificationsService.create({
      userId: doctor.userId,
      type: NotificationType.TOKEN_ACCESS_GRANTED,
      title: 'Nuevo token de acceso recibido',
      message: `${patient.user?.nombre || 'Un paciente'} generó un token para que puedas consultar su expediente clínico.`,
      link: '/medico/validar-token',
      metadata: {
        patientId: patient.id,
        tokenId: saved.id,
        token: saved.pin,
        nivelAcceso: saved.nivelAcceso,
        expiresAt: saved.expiresAt,
      },
    });
    return this.toResponse(saved);
  }

  // 2. El Paciente/Especialista ingresa el Token para ver el expediente
  async validateToken(doctorUserId: number, pin: string) {
    const normalizedPin = pin?.toUpperCase().trim();
    if (!normalizedPin) throw new BadRequestException('Token requerido');

    const token = await this.tokensRepository.findOne({
      where: { pin: normalizedPin },
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
    });

    if (!token) throw new NotFoundException('Token incorrecto');
    if (token.revokedAt) throw new BadRequestException('Este Token fue revocado');
    if (new Date() > token.expiresAt) throw new BadRequestException('Este Token ha expirado');
    if (token.isUsed) throw new BadRequestException('Este Token ya fue utilizado');
    if (token.doctorId && token.doctor?.userId !== doctorUserId) {
      throw new BadRequestException('Este token fue generado para otro médico');
    }

    token.isUsed = true;
    token.usedByUserId = doctorUserId;
    await this.tokensRepository.save(token);
    if (!token.doctorId) {
      await this.notificationsService.create({
        userId: doctorUserId,
        type: NotificationType.TOKEN_ACCESS_GRANTED,
        title: 'Acceso a expediente autorizado',
        message: `${token.patient.user?.nombre || 'Un paciente'} te autorizó acceso a su expediente clínico mediante token.`,
        link: `/medico/expediente/${token.patient.id}`,
        metadata: {
          patientId: token.patient.id,
          tokenId: token.id,
          nivelAcceso: token.nivelAcceso,
          expiresAt: token.expiresAt,
        },
      });
    }

    return {
      message: 'Acceso concedido',
      patientId: token.patient.id,
      nivelAcceso: token.nivelAcceso,
    };
  }

  // 3. Obtener los tokens del paciente
  async getMyTokens(userId: number) {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const tokens = await this.tokensRepository.find({
      where: { patient: { id: patient.id } },
      relations: ['doctor', 'doctor.user'],
      order: { createdAt: 'DESC' },
    });

    return tokens.map((token) => this.toResponse(token));
  }

  async revokeToken(userId: number, tokenId: number) {
    if (!Number.isInteger(tokenId) || tokenId <= 0) {
      throw new BadRequestException('Token inválido');
    }

    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const token = await this.tokensRepository.findOne({
      where: { id: tokenId, patient: { id: patient.id } },
      relations: ['patient'],
    });

    if (!token) throw new NotFoundException('Token no encontrado');
    if (!token.revokedAt) {
      token.revokedAt = new Date();
      await this.tokensRepository.save(token);
    }

    return this.toResponse(token);
  }

  private async generateUniquePin() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let attempt = 0; attempt < 5; attempt++) {
      let pin = '';
      for (let i = 0; i < 12; i++) {
        pin += characters.charAt(Math.floor(Math.random() * characters.length));
      }

      const existing = await this.tokensRepository.exists({ where: { pin } });
      if (!existing) return pin;
    }

    throw new BadRequestException('No se pudo generar un token único, intenta de nuevo');
  }

  private getEstado(token: Token): TokenEstado {
    if (token.revokedAt) return 'revocado';
    if (new Date() > token.expiresAt) return 'expirado';
    if (token.isUsed) return 'usado';
    return 'activo';
  }

  private toResponse(token: Token) {
    return {
      id: token.id,
      token: token.pin,
      nivelAcceso: token.nivelAcceso || 'lectura',
      descripcion: token.descripcion || '',
      createdAt: token.createdAt,
      fechaExpiracion: token.expiresAt,
      expiresAt: token.expiresAt,
      isUsed: token.isUsed,
      usedByUserId: token.usedByUserId,
      doctorId: token.doctorId,
      doctor: token.doctor ? {
        id: token.doctor.id,
        nombre: token.doctor.user?.nombre,
        especialidad: token.doctor.especialidad,
      } : null,
      revokedAt: token.revokedAt,
      estado: this.getEstado(token),
    };
  }

  async hasDoctorAccess(doctorUserId: number, patientId: number) {
    const accessToken = await this.tokensRepository.findOne({
      where: {
        patient: { id: patientId },
        usedByUserId: doctorUserId,
        isUsed: true,
      },
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });

    if (!accessToken) return false;
    return !accessToken.revokedAt && new Date() <= accessToken.expiresAt;
  }

  async findAuthorizedPatientIds(doctorUserId: number) {
    const rows = await this.tokensRepository
      .createQueryBuilder('token')
      .innerJoin('token.patient', 'patient')
      .select('patient.id', 'patientId')
      .where('token.usedByUserId = :doctorUserId', { doctorUserId })
      .andWhere('token.isUsed = :isUsed', { isUsed: true })
      .andWhere('token.revokedAt IS NULL')
      .andWhere('token.expiresAt >= :now', { now: new Date() })
      .orderBy('token.createdAt', 'DESC')
      .getRawMany<{ patientId: number }>();

    return [...new Set(rows.map((row) => Number(row.patientId)))];
  }
}
