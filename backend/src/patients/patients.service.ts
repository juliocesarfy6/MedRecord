import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service'; // 👈 1. Importamos el servicio

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private auditService: AuditService, // 👈 2. Lo inyectamos en el constructor
  ) { }

  async findAll() {
    return this.patientsRepository.find({
      relations: ['user'],
      select: { user: { id: true, nombre: true, email: true, status: true } },
    });
  }

  async findOne(id: string) {
    const patient = await this.patientsRepository.findOne({
      where: { id: +id },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Paciente no encontrado');
    return patient;
  }

  async findByUserId(userId: string) {
    const patient = await this.patientsRepository.findOne({
      where: { user: { id: +userId } },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Perfil de paciente no encontrado');

    // 👈 3. Guardamos en bitácora que el paciente vio su perfil
    this.auditService.log({
      user: patient.user,
      accion: 'VIEW_PROFILE',
      detalles: 'El paciente consultó su expediente personal',
      pacienteId: patient.id.toString(),
    }).catch(console.error);

    return patient;
  }

  async update(id: string, data: Partial<Patient>) {
    const patient = await this.findOne(id);
    Object.assign(patient, data);
    return this.patientsRepository.save(patient);
  }

  async updateByUserId(userId: string, data: Partial<Patient>) {
    const patient = await this.findByUserId(userId);
    Object.assign(patient, data);
    const updatedPatient = await this.patientsRepository.save(patient);

    // 👈 4. Guardamos en bitácora que el paciente actualizó sus datos
    this.auditService.log({
      user: patient.user,
      accion: 'UPDATE_PROFILE',
      detalles: 'El paciente actualizó su información personal',
      pacienteId: patient.id.toString(),
    }).catch(console.error);

    return updatedPatient;
  }
}