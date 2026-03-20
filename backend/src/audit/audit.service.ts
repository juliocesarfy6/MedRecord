import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async log(data: {
    user?: User;
    accion: string;
    ip?: string;
    detalles?: string;
    pacienteId?: string;
  }) {
    const log = this.auditRepository.create({
      user: data.user,
      accion: data.accion,
      ip: data.ip,
      detalles: data.detalles,
      patientId: data.pacienteId ? +data.pacienteId : undefined,
    });
    return this.auditRepository.save(log);
  }

  async findAll() {
    return this.auditRepository.find({
      relations: ['user'],
      order: { fecha: 'DESC' },
      take: 200,
    });
  }

  async findByUser(userId: string) {
    return this.auditRepository.find({
      where: { user: { id: +userId } },
      order: { fecha: 'DESC' },
      take: 100,
    });
  }

  async findByPatient(pacienteId: string) {
    return this.auditRepository.find({
      where: { patientId: +pacienteId },
      relations: ['user'],
      order: { fecha: 'DESC' },
      take: 100,
    });
  }
}
