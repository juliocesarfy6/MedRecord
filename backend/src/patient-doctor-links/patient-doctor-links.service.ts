import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { NotificationType } from '../entities/notification.entity';
import { PatientDoctorLink, PatientDoctorLinkStatus } from '../entities/patient-doctor-link.entity';
import { Patient } from '../entities/patient.entity';
import { UserStatus } from '../entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLinkRequestDto } from './dto/create-link-request.dto';
import { RespondLinkRequestDto } from './dto/respond-link-request.dto';

@Injectable()
export class PatientDoctorLinksService {
  constructor(
    @InjectRepository(PatientDoctorLink)
    private linksRepository: Repository<PatientDoctorLink>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    private notificationsService: NotificationsService,
  ) {}

  async searchDoctorsForPatient(userId: number, search = '') {
    const patient = await this.getPatientByUser(userId);
    const qb = this.doctorsRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.user', 'user')
      .leftJoinAndMapOne('doctor.link', PatientDoctorLink, 'link', 'link.doctorId = doctor.id AND link.patientId = :patientId', { patientId: patient.id })
      .where('doctor.validadoPorAdmin = :validado', { validado: true })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .orderBy('user.nombre', 'ASC');

    const term = search.trim();
    if (term) {
      qb.andWhere(new Brackets((where) => {
        where
          .where('user.nombre LIKE :term', { term: `%${term}%` })
          .orWhere('doctor.especialidad LIKE :term', { term: `%${term}%` })
          .orWhere('doctor.cedulaProfesional LIKE :term', { term: `%${term}%` });
      }));
    }

    const doctors = await qb.getMany();
    return doctors.map((doctor: any) => this.toDoctorDirectoryItem(doctor, doctor.link || null));
  }

  async findAcceptedDoctorsForPatient(userId: number) {
    const patient = await this.getPatientByUser(userId);
    const links = await this.linksRepository.find({
      where: { patientId: patient.id, status: PatientDoctorLinkStatus.ACCEPTED },
      relations: ['doctor', 'doctor.user', 'doctor.availability'],
      order: { updatedAt: 'DESC' },
    });

    return links
      .filter((link) => link.doctor?.validadoPorAdmin && link.doctor?.user?.status === UserStatus.ACTIVE)
      .map((link) => ({
        id: link.doctor.id,
        nombre: link.doctor.user?.nombre,
        email: link.doctor.user?.email,
        especialidad: link.doctor.especialidad,
        cedulaProfesional: link.doctor.cedulaProfesional,
        linkId: link.id,
        status: link.status,
        availability: link.doctor.availability || [],
      }));
  }

  async requestLink(userId: number, dto: CreateLinkRequestDto) {
    const patient = await this.getPatientByUser(userId);
    const doctor = await this.doctorsRepository.findOne({
      where: { id: dto.doctorId },
      relations: ['user'],
    });
    if (!doctor || !doctor.validadoPorAdmin || doctor.user?.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('El médico seleccionado no está disponible');
    }

    let link = await this.linksRepository.findOne({ where: { patientId: patient.id, doctorId: doctor.id } });
    if (link?.status === PatientDoctorLinkStatus.ACCEPTED) {
      throw new BadRequestException('Ya estás vinculado con este médico');
    }
    if (link?.status === PatientDoctorLinkStatus.PENDING) {
      throw new BadRequestException('Ya tienes una solicitud pendiente con este médico');
    }

    if (!link) {
      link = this.linksRepository.create({ patientId: patient.id, doctorId: doctor.id });
    }
    link.status = PatientDoctorLinkStatus.PENDING;
    link.message = dto.message || null;
    link.responseMessage = null;
    const saved = await this.linksRepository.save(link);

    await this.notificationsService.create({
      userId: doctor.userId,
      type: NotificationType.PATIENT_LINK_REQUEST,
      title: 'Nueva solicitud de paciente',
      message: `${patient.user?.nombre || 'Un paciente'} quiere vincularse contigo para agendar citas y compartir tokens.`,
      link: '/medico/solicitudes',
      metadata: { linkId: saved.id, patientId: patient.id },
    });

    return saved;
  }

  async findRequestsForDoctor(userId: number) {
    const doctor = await this.getDoctorByUser(userId);
    return this.linksRepository.find({
      where: { doctorId: doctor.id },
      relations: ['patient', 'patient.user'],
      order: { updatedAt: 'DESC' },
    });
  }

  async acceptRequest(userId: number, linkId: number, dto: RespondLinkRequestDto) {
    const { link } = await this.getDoctorLink(userId, linkId);
    link.status = PatientDoctorLinkStatus.ACCEPTED;
    link.responseMessage = dto.responseMessage || null;
    return this.linksRepository.save(link);
  }

  async rejectRequest(userId: number, linkId: number, dto: RespondLinkRequestDto) {
    const { link } = await this.getDoctorLink(userId, linkId);
    link.status = PatientDoctorLinkStatus.REJECTED;
    link.responseMessage = dto.responseMessage || null;
    return this.linksRepository.save(link);
  }

  async ensureAcceptedLink(patientId: number, doctorId: number) {
    const link = await this.linksRepository.findOne({
      where: { patientId, doctorId, status: PatientDoctorLinkStatus.ACCEPTED },
    });
    if (!link) {
      throw new ForbiddenException('Primero debes estar vinculado con este médico');
    }
    return link;
  }

  private async getDoctorLink(userId: number, linkId: number) {
    const doctor = await this.getDoctorByUser(userId);
    const link = await this.linksRepository.findOne({
      where: { id: linkId },
      relations: ['patient', 'patient.user'],
    });
    if (!link) throw new NotFoundException('Solicitud no encontrada');
    if (link.doctorId !== doctor.id) {
      throw new ForbiddenException('No puedes gestionar esta solicitud');
    }
    return { doctor, link };
  }

  private async getPatientByUser(userId: number) {
    const patient = await this.patientsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!patient) throw new NotFoundException('Perfil de paciente no encontrado');
    return patient;
  }

  private async getDoctorByUser(userId: number) {
    const doctor = await this.doctorsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });
    if (!doctor) throw new NotFoundException('Perfil médico no encontrado');
    return doctor;
  }

  private toDoctorDirectoryItem(doctor: any, link: PatientDoctorLink | null) {
    return {
      id: doctor.id,
      nombre: doctor.user?.nombre,
      email: doctor.user?.email,
      especialidad: doctor.especialidad,
      cedulaProfesional: doctor.cedulaProfesional,
      link: link ? {
        id: link.id,
        status: link.status,
        message: link.message,
        responseMessage: link.responseMessage,
      } : null,
    };
  }
}
