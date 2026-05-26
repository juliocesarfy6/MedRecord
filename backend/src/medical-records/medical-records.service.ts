import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
import { TokensService } from '../tokens/tokens.service';
import { PatientDoctorLinksService } from '../patient-doctor-links/patient-doctor-links.service';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord) private recordsRepository: Repository<MedicalRecord>,
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    private auditService: AuditService,
    private tokensService: TokensService,
    private patientDoctorLinksService: PatientDoctorLinksService,
  ) { }

  /**
   * Crea un nuevo registro clínico en la base de datos
   */
  async createRecord(userId: number, createDto: CreateMedicalRecordDto) {
    this.ensureConsultationDateIsValid(createDto.fecha);

    // 1. Validamos al doctor y su estatus de administrador
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user']
    });

    if (!doctor) throw new NotFoundException('Perfil de médico no encontrado');

    if (!doctor.validadoPorAdmin) {
      throw new ForbiddenException('No puedes crear historiales hasta ser validado por un Administrador');
    }

    // 2. Validamos que el paciente exista
    const patient = await this.patientRepository.findOne({
      where: { id: createDto.patientId },
      relations: ['user']
    });

    if (!patient) throw new NotFoundException('Paciente no encontrado');

    await this.patientDoctorLinksService.ensureAcceptedLink(patient.id, doctor.id);

    // 3. Creamos la entidad del registro médico
    const newRecord = this.recordsRepository.create({
      motivo: createDto.motivoConsulta,
      diagnostico: createDto.diagnostico,
      tratamiento: createDto.tratamiento,
      observaciones: createDto.observaciones,
      fecha: createDto.fecha ? new Date(createDto.fecha) : new Date(),
      doctor: doctor,
      patient: patient,
    });

    const savedRecord = await this.recordsRepository.save(newRecord);

    // 4. Registro de auditoría (Seguridad)
    this.auditService.log({
      user: doctor.user,
      accion: 'CREATE_MEDICAL_RECORD',
      detalles: `Médico ID ${doctor.id} creó historial para el Paciente ID ${patient.id}`,
      pacienteId: patient.id.toString(),
    }).catch(err => console.error('Error en auditoría:', err));

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

  /**
   * Obtiene todos los registros médicos de un paciente específico
   */
  async findByPatient(userId: number, patientId: number) {
    const hasAccess = await this.tokensService.hasDoctorAccess(userId, patientId);
    if (!hasAccess) {
      throw new ForbiddenException('Necesitas validar un token vigente de este paciente');
    }

    const records = await this.recordsRepository.find({
      where: { patient: { id: patientId } },
      relations: ['doctor', 'doctor.user'], // Para mostrar quién realizó la consulta
      order: { fecha: 'DESC' }, // La consulta más reciente primero
    });

    return records;
  }

  async findOneForDoctor(userId: number, recordId: number) {
    const record = await this.findRecordOrFail(recordId);
    await this.ensureDoctorCanReadPatient(userId, record.patientId);
    return record;
  }

  async updateRecord(userId: number, recordId: number, updateDto: UpdateMedicalRecordDto) {
    const doctor = await this.findDoctorOrFail(userId);
    const record = await this.findRecordOrFail(recordId);
    await this.ensureDoctorCanModifyRecord(userId, doctor.id, record);
    this.ensureConsultationDateIsValid(updateDto.fecha);

    if (updateDto.motivoConsulta !== undefined) record.motivo = updateDto.motivoConsulta;
    if (updateDto.diagnostico !== undefined) record.diagnostico = updateDto.diagnostico;
    if (updateDto.tratamiento !== undefined) record.tratamiento = updateDto.tratamiento;
    if (updateDto.observaciones !== undefined) record.observaciones = updateDto.observaciones;
    if (updateDto.fecha !== undefined) record.fecha = new Date(updateDto.fecha);

    const savedRecord = await this.recordsRepository.save(record);

    this.auditService.log({
      user: doctor.user,
      accion: 'UPDATE_MEDICAL_RECORD',
      detalles: `Médico ID ${doctor.id} actualizó consulta ID ${record.id}`,
      pacienteId: record.patientId.toString(),
    }).catch(err => console.error('Error en auditoría:', err));

    return savedRecord;
  }

  async deleteRecord(userId: number, recordId: number) {
    const doctor = await this.findDoctorOrFail(userId);
    const record = await this.findRecordOrFail(recordId);
    await this.ensureDoctorCanModifyRecord(userId, doctor.id, record);
    const patientId = record.patientId;

    await this.recordsRepository.remove(record);

    this.auditService.log({
      user: doctor.user,
      accion: 'DELETE_MEDICAL_RECORD',
      detalles: `Médico ID ${doctor.id} eliminó consulta ID ${recordId}`,
      pacienteId: patientId.toString(),
    }).catch(err => console.error('Error en auditoría:', err));

    return { message: 'Consulta eliminada correctamente' };
  }

  private async findDoctorOrFail(userId: number) {
    const doctor = await this.doctorRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!doctor) throw new NotFoundException('Perfil de médico no encontrado');
    if (!doctor.validadoPorAdmin) {
      throw new ForbiddenException('No puedes gestionar consultas hasta ser validado por un Administrador');
    }

    return doctor;
  }

  private async findRecordOrFail(recordId: number) {
    if (!Number.isInteger(recordId) || recordId <= 0) {
      throw new BadRequestException('ID de consulta inválido');
    }

    const record = await this.recordsRepository.findOne({
      where: { id: recordId },
      relations: ['doctor', 'doctor.user', 'patient', 'patient.user'],
    });

    if (!record) throw new NotFoundException('Consulta no encontrada');
    return record;
  }

  private async ensureDoctorCanReadPatient(userId: number, patientId: number) {
    const hasAccess = await this.tokensService.hasDoctorAccess(userId, patientId);
    if (!hasAccess) {
      throw new ForbiddenException('Necesitas validar un token vigente de este paciente');
    }
  }

  private async ensureDoctorCanModifyRecord(userId: number, doctorId: number, record: MedicalRecord) {
    await this.ensureDoctorCanReadPatient(userId, record.patientId);
    if (record.doctorId !== doctorId) {
      throw new ForbiddenException('Solo el médico que registró la consulta puede modificarla');
    }
  }

  private ensureConsultationDateIsValid(fecha?: string) {
    if (!fecha) return;

    const date = new Date(fecha);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
      throw new BadRequestException('La fecha de consulta no puede estar en el futuro');
    }
  }
}
