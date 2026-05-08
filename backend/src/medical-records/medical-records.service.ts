import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class MedicalRecordsService {
  constructor(
    @InjectRepository(MedicalRecord) private recordsRepository: Repository<MedicalRecord>,
    @InjectRepository(Doctor) private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient) private patientRepository: Repository<Patient>,
    private auditService: AuditService,
    private tokensService: TokensService,
  ) { }

  /**
   * Crea un nuevo registro clínico en la base de datos
   */
  async createRecord(userId: number, createDto: CreateMedicalRecordDto) {
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

    const hasAccess = await this.tokensService.hasDoctorAccess(userId, patient.id);
    if (!hasAccess) {
      throw new ForbiddenException('Necesitas validar un token vigente del paciente antes de registrar una consulta');
    }

    // 3. Creamos la entidad del registro médico
    const newRecord = this.recordsRepository.create({
      motivo: createDto.motivoConsulta,
      diagnostico: createDto.diagnostico,
      tratamiento: createDto.tratamiento,
      observaciones: createDto.observaciones,
      fecha: new Date(), // Sincronizado con la zona horaria del servidor
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
}
