import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { MedicalRecord } from '../entities/medical-record.entity';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Token) private tokensRepository: Repository<Token>,
    @InjectRepository(MedicalRecord) private recordsRepository: Repository<MedicalRecord>,
  ) { }

  // 1. Un Doctor genera el PIN de 6 dígitos
  async generatePin(recordId: number) {
    const record = await this.recordsRepository.findOne({ where: { id: recordId } });
    if (!record) throw new NotFoundException('Historial médico no encontrado');

    // Magia: Generamos un PIN numérico aleatorio de 6 dígitos (ej. 492015)
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // El PIN caduca en 24 horas
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const newToken = this.tokensRepository.create({
      pin: pin,
      expiresAt: expiresAt,
      isUsed: false,
      medicalRecord: record,
    });

    return this.tokensRepository.save(newToken);
  }

  // 2. El Paciente/Especialista ingresa el PIN para ver la receta
  async validatePin(pin: string) {
    const token = await this.tokensRepository.findOne({
      where: { pin: pin },
      relations: ['medicalRecord', 'medicalRecord.doctor', 'medicalRecord.patient'],
    });

    if (!token) throw new NotFoundException('PIN incorrecto');
    if (token.isUsed) throw new BadRequestException('Este PIN ya fue utilizado');
    if (new Date() > token.expiresAt) throw new BadRequestException('Este PIN ha expirado');

    // Regla estricta: Quemamos el PIN para que sea de "Un solo uso"
    token.isUsed = true;
    await this.tokensRepository.save(token);

    // Si todo es válido, entregamos el historial clínico completo
    return {
      message: 'Acceso concedido',
      medicalRecord: token.medicalRecord,
    };
  }
}