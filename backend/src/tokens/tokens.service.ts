import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';

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

    // Generamos un token alfanumérico aleatorio de 12 caracteres
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pin = '';
    for (let i = 0; i < 12; i++) {
        pin += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Calculamos caducidad
    const horasExpiracion = data.horasExpiracion ? Number(data.horasExpiracion) : 24;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + horasExpiracion);

    const newToken = this.tokensRepository.create({
      pin: pin,
      expiresAt: expiresAt,
      isUsed: false,
      nivelAcceso: data.nivelAcceso || 'lectura',
      descripcion: data.descripcion || '',
      patient: patient,
    });

    await this.tokensRepository.save(newToken);
    return { token: pin };
  }

  // 2. El Paciente/Especialista ingresa el Token para ver el expediente
  async validateToken(pin: string) {
    const token = await this.tokensRepository.findOne({
      where: { pin: pin },
      relations: ['patient'],
    });

    if (!token) throw new NotFoundException('Token incorrecto');
    if (new Date() > token.expiresAt) throw new BadRequestException('Este Token ha expirado');

    // Opcional: si queremos marcarlo como usado
    if (!token.isUsed) {
        token.isUsed = true;
        await this.tokensRepository.save(token);
    }

    // Si todo es válido, entregamos la información mínima para que el frontend redirija
    return {
      message: 'Acceso concedido',
      patientId: token.patient.id,
      nivelAcceso: token.nivelAcceso
    };
  }

  // 3. Obtener los tokens del paciente
  async getMyTokens(userId: number) {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    return this.tokensRepository.find({
      where: { patient: { id: patient.id } },
      order: { createdAt: 'DESC' }
    });
  }
}