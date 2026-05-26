import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service'; // 👈 1. Importamos el servicio
import { TokensService } from '../tokens/tokens.service';
import { UserRole, UserStatus } from '../entities/user.entity';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Doctor } from '../entities/doctor.entity';
import { PatientDoctorLink, PatientDoctorLinkStatus } from '../entities/patient-doctor-link.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(PatientDoctorLink)
    private linksRepository: Repository<PatientDoctorLink>,
    private auditService: AuditService, // 👈 2. Lo inyectamos en el constructor
    private tokensService: TokensService,
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

  async findOneForUser(id: string, user: any) {
    if (user.role === UserRole.ADMIN) return this.findOne(id);

    if (user.role === UserRole.DOCTOR) {
      const patientId = +id;
      const hasAccess = await this.tokensService.hasDoctorAccess(user.id, patientId);
      if (!hasAccess) {
        throw new ForbiddenException('Necesitas validar un token vigente de este paciente');
      }

      return this.findOne(id);
    }

    throw new ForbiddenException('No tienes permiso para consultar este paciente');
  }

  async findAuthorizedForDoctor(userId: number) {
    const doctor = await this.doctorsRepository.findOne({ where: { userId } });
    if (!doctor) throw new NotFoundException('Perfil de médico no encontrado');

    const links = await this.linksRepository.find({
      where: { doctorId: doctor.id, status: PatientDoctorLinkStatus.ACCEPTED },
      order: { updatedAt: 'DESC' },
    });

    const patientIds = links.map((link) => link.patientId);
    if (patientIds.length === 0) return [];

    const patients = await this.patientsRepository.find({
      where: { id: In(patientIds), user: { status: UserStatus.ACTIVE } },
      relations: ['user'],
      select: { user: { id: true, nombre: true, email: true, status: true } },
    });

    return patients.sort((a, b) => patientIds.indexOf(a.id) - patientIds.indexOf(b.id));
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

  async update(id: string, data: UpdatePatientDto) {
    const patient = await this.findOne(id);
    this.ensureBirthDateIsValid(data.fechaNacimiento);
    Object.assign(patient, data);
    return this.patientsRepository.save(patient);
  }

  async updateByUserId(userId: string, data: UpdatePatientDto) {
    const patient = await this.findByUserId(userId);
    this.ensureBirthDateIsValid(data.fechaNacimiento);
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

  private ensureBirthDateIsValid(fechaNacimiento?: string) {
    if (!fechaNacimiento) return;

    const date = new Date(fechaNacimiento);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
      throw new BadRequestException('La fecha de nacimiento no puede estar en el futuro');
    }
  }
}
