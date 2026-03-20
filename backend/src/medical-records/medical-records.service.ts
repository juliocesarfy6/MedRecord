import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Patient } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord)
    private recordsRepository: Repository<MedicalRecord>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
  ) {}

  async create(data: {
    patientId: string;
    doctorId: string; // This comes from JWT user.id, so it's a User ID, not directly a Doctor entity ID.
    fecha: string;
    motivo: string;
    diagnostico?: string;
    tratamiento?: string;
    observaciones?: string;
  }) {
    const patient = await this.patientsRepository.findOne({ where: { id: +data.patientId } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    // The frontend sends doctorId as the currently logged in User's ID
    const doctor = await this.doctorsRepository.findOne({ where: { user: { id: +data.doctorId } } });

    const record = this.recordsRepository.create({
      fecha: new Date(data.fecha),
      motivo: data.motivo,
      diagnostico: data.diagnostico,
      tratamiento: data.tratamiento,
      observaciones: data.observaciones,
      patient: { id: patient.id } as Patient,
      doctor: doctor ? ({ id: doctor.id } as Doctor) : undefined,
    });

    return this.recordsRepository.save(record);
  }

  async findByPatient(patientId: string) {
    return this.recordsRepository.find({
      where: { patient: { id: +patientId } },
      relations: ['doctor', 'doctor.user'],
      order: { fecha: 'DESC' },
    });
  }

  async findByUserId(userId: string) {
    const patient = await this.patientsRepository.findOne({ where: { user: { id: +userId } } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');
    return this.findByPatient(patient.id.toString());
  }

  async findOne(id: string) {
    const record = await this.recordsRepository.findOne({
      where: { id: +id },
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
    });
    if (!record) throw new NotFoundException('Registro no encontrado');
    return record;
  }
}
