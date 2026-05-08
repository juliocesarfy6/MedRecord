import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';

type TokenEstado = 'activo' | 'usado' | 'expirado' | 'revocado';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token) private tokensRepository: Repository<Token>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
  ) { }

  // 1. Un Paciente genera el Token
  async generateToken(userId: number, data: any) {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const horasExpiracion = data.horasExpiracion ? Number(data.horasExpiracion) : 24;
    if (!Number.isFinite(horasExpiracion) || horasExpiracion <= 0 || horasExpiracion > 168) {
      throw new BadRequestException('El tiempo de validez debe estar entre 1 hora y 1 semana');
    }

    const pin = await this.generateUniquePin();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + horasExpiracion);

    const newToken = this.tokensRepository.create({
      pin,
      expiresAt,
      isUsed: false,
      usedByUserId: null,
      revokedAt: null,
      nivelAcceso: data.nivelAcceso || 'lectura',
      descripcion: data.descripcion || '',
      patient,
    });

    const saved = await this.tokensRepository.save(newToken);
    return this.toResponse(saved);
  }

  // 2. El Paciente/Especialista ingresa el Token para ver el expediente
  async validateToken(doctorUserId: number, pin: string) {
    const normalizedPin = pin?.toUpperCase().trim();
    if (!normalizedPin) throw new BadRequestException('Token requerido');

    const token = await this.tokensRepository.findOne({
      where: { pin: normalizedPin },
      relations: ['patient'],
    });

    if (!token) throw new NotFoundException('Token incorrecto');
    if (token.revokedAt) throw new BadRequestException('Este Token fue revocado');
    if (new Date() > token.expiresAt) throw new BadRequestException('Este Token ha expirado');
    if (token.isUsed) throw new BadRequestException('Este Token ya fue utilizado');

    token.isUsed = true;
    token.usedByUserId = doctorUserId;
    await this.tokensRepository.save(token);

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
    const tokens = await this.tokensRepository.find({
      where: {
        usedByUserId: doctorUserId,
        isUsed: true,
      },
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });

    const now = new Date();
    const patientIds = tokens
      .filter((token) => token.patient && !token.revokedAt && now <= token.expiresAt)
      .map((token) => token.patient.id);

    return [...new Set(patientIds)];
  }
}
