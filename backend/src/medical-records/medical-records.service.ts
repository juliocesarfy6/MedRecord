import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Patient } from '../entities/patient.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private recordsRepository: Repository<MedicalRecord>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
  ) {}

  async create(data: {
    patientId: string;
    doctorId: string;
    fecha: string;
    motivo: string;
    diagnostico?: string;
    tratamiento?: string;
    observaciones?: string;
    medicamentos?: string;
  }) {
    const patient = await this.patientsRepository.findOne({ where: { id: data.patientId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const record = this.recordsRepository.create({
      fecha: new Date(data.fecha),
      motivo: data.motivo,
      diagnostico: data.diagnostico,
      tratamiento: data.tratamiento,
      observaciones: data.observaciones,
      medicamentos: data.medicamentos,
      patient: { id: data.patientId } as Patient,
      doctor: { id: data.doctorId } as User,
    });

    return this.recordsRepository.save(record);
  }

  async findByPatient(patientId: string) {
    return this.recordsRepository.find({
      where: { patient: { id: patientId } },
      relations: ['doctor'],
      order: { fecha: 'DESC' },
    });
  }

  async findByUserId(userId: string) {
    const patient = await this.patientsRepository.findOne({ where: { user: { id: userId } } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');
    return this.findByPatient(patient.id);
  }

  async findOne(id: string) {
    const record = await this.recordsRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'doctor'],
    });
    if (!record) throw new NotFoundException('Registro no encontrado');
    return record;
  }
}
