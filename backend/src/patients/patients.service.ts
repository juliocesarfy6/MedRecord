import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async findAll() {
    return this.patientsRepository.find({
      relations: ['user'],
      select: { user: { id: true, nombre: true, email: true, status: true } },
    });
  }

  async findOne(id: string) {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Paciente no encontrado');
    return patient;
  }

  async findByUserId(userId: string) {
    const patient = await this.patientsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Perfil de paciente no encontrado');
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
    return this.patientsRepository.save(patient);
  }
}
