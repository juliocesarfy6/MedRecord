import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord) private recordsRepository: Repository<MedicalRecord>,
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    private auditService: AuditService,
  ) { }

  async createRecord(userId: number, createDto: CreateMedicalRecordDto) {
    // 1. Validamos al doctor
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!doctor) throw new NotFoundException('Perfil de médico no encontrado');

    if (!doctor.validadoPorAdmin) {
      throw new ForbiddenException('No puedes crear historiales hasta ser validado por un Administrador');
    }

    // 2. Validamos al paciente
    const patient = await this.patientRepository.findOne({
      where: { id: createDto.patientId },
      relations: ['user']
    });

    if (!patient) throw new NotFoundException('Paciente no encontrado');

    // 3. Creamos el registro
    const newRecord = this.recordsRepository.create({
      motivo: createDto.motivoConsulta,
      diagnostico: createDto.diagnostico,
      tratamiento: createDto.tratamiento,
      observaciones: createDto.observaciones,
      fecha: new Date(), // Guardamos la fecha actual
      doctor: doctor,
      patient: patient,
    });

    const savedRecord = await this.recordsRepository.save(newRecord);

    // 4. Guardamos la auditoría
    this.auditService.log({
      user: doctor.user,
      accion: 'CREATE_MEDICAL_RECORD',
      detalles: `Médico ID ${doctor.id} creó historial para el Paciente ID ${patient.id}`,
      pacienteId: patient.id.toString(),
    }).catch(console.error);

    return savedRecord;
  }

  async getMyRecords(userId: number) {
    const patient = await this.patientRepository.findOne({ where: { user: { id: userId } } });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    return this.recordsRepository.find({
      where: { patient: { id: patient.id } },
      relations: ['doctor', 'doctor.user'],
      order: { fecha: 'DESC' },
    });
  }
}