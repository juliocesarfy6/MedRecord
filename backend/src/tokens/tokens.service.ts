import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token, TokenStatus, AccessLevel } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async generate(userId: string, data: {
    nivelAcceso: AccessLevel;
    horasExpiracion: number;
    descripcion?: string;
  }) {
    const patient = await this.patientsRepository.findOne({ where: { user: { id: userId } } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const hours = data.horasExpiracion || 24;
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + hours);

    const token = this.tokensRepository.create({
      token: uuidv4().replace(/-/g, '').toUpperCase().substring(0, 12),
      nivelAcceso: data.nivelAcceso || AccessLevel.READ,
      estado: TokenStatus.ACTIVE,
      fechaExpiracion,
      descripcion: data.descripcion,
      patient,
    });

    return this.tokensRepository.save(token);
  }

  async validate(tokenValue: string) {
    const token = await this.tokensRepository.findOne({
      where: { token: tokenValue },
      relations: ['patient', 'patient.user'],
    });

    if (!token) throw new NotFoundException('Token no encontrado');

    if (token.estado === TokenStatus.REVOKED) {
      throw new BadRequestException('Token revocado');
    }

    if (token.estado === TokenStatus.EXPIRED || new Date() > token.fechaExpiracion) {
      if (token.estado !== TokenStatus.EXPIRED) {
        token.estado = TokenStatus.EXPIRED;
        await this.tokensRepository.save(token);
      }
      throw new BadRequestException('Token expirado');
    }

    return {
      valid: true,
      patientId: token.patient.id,
      nivelAcceso: token.nivelAcceso,
      patient: token.patient,
    };
  }

  async revoke(tokenId: string, userId: string) {
    const patient = await this.patientsRepository.findOne({ where: { user: { id: userId } } });
    const token = await this.tokensRepository.findOne({
      where: { id: tokenId, patient: { id: patient?.id } },
    });
    if (!token) throw new NotFoundException('Token no encontrado');
    token.estado = TokenStatus.REVOKED;
    return this.tokensRepository.save(token);
  }

  async findByPatient(userId: string) {
    const patient = await this.patientsRepository.findOne({ where: { user: { id: userId } } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');
    return this.tokensRepository.find({
      where: { patient: { id: patient.id } },
      order: { createdAt: 'DESC' },
    });
  }
}
