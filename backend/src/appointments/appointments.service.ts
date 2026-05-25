import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { AuditService } from '../audit/audit.service';
import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { DoctorAvailability } from '../entities/doctor-availability.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { UserStatus } from '../entities/user.entity';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { NotificationType } from '../entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { PatientDoctorLinksService } from '../patient-doctor-links/patient-doctor-links.service';

const APPOINTMENT_MINUTES = 30;
const ACTIVE_APPOINTMENT_STATUSES = [
  AppointmentStatus.PENDING,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.RESCHEDULED,
];

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(DoctorAvailability)
    private availabilityRepository: Repository<DoctorAvailability>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private linksService: PatientDoctorLinksService,
  ) {}

  async create(userId: number, dto: CreateAppointmentDto) {
    const patient = await this.getPatientByUser(userId);
    const doctor = await this.getValidatedDoctor(dto.doctorId);
    await this.linksService.ensureAcceptedLink(patient.id, doctor.id);
    const { start, end } = await this.validateSlot(doctor.id, dto.fechaHoraInicio);

    const appointment = this.appointmentsRepository.create({
      patientId: patient.id,
      doctorId: doctor.id,
      fechaHoraInicio: start,
      fechaHoraFin: end,
      motivo: dto.motivo,
      notas: dto.notas || null,
      estado: AppointmentStatus.PENDING,
    });

    const saved = await this.appointmentsRepository.save(appointment);
    await this.auditService.log({
      user: patient.user,
      accion: 'CREATE_APPOINTMENT',
      pacienteId: String(patient.id),
      detalles: `Cita creada con medico ${doctor.id} para ${start.toISOString()}`,
    });
    await this.notificationsService.create({
      userId: doctor.userId,
      type: NotificationType.APPOINTMENT_CREATED,
      title: 'Nueva cita agendada',
      message: `${patient.user?.nombre || 'Un paciente'} agendó una cita para ${this.formatDateTime(start)}.`,
      link: '/medico/citas',
      metadata: {
        appointmentId: saved.id,
        patientId: patient.id,
        fechaHoraInicio: start.toISOString(),
      },
    });

    return this.findOneWithRelations(saved.id);
  }

  async findMyAppointments(userId: number) {
    const patient = await this.getPatientByUser(userId);
    return this.appointmentsRepository.find({
      where: { patientId: patient.id },
      relations: ['doctor', 'doctor.user'],
      order: { fechaHoraInicio: 'DESC' },
    });
  }

  async cancel(userId: number, appointmentId: number, dto: CancelAppointmentDto) {
    const patient = await this.getPatientByUser(userId);
    const appointment = await this.findOneWithRelations(appointmentId);

    if (appointment.patientId !== patient.id) {
      throw new ForbiddenException('Solo puedes cancelar tus propias citas');
    }
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(appointment.estado)) {
      throw new BadRequestException('Esta cita ya no se puede cancelar');
    }

    appointment.estado = AppointmentStatus.CANCELLED;
    appointment.cancelReason = dto.cancelReason || null;
    const saved = await this.appointmentsRepository.save(appointment);

    await this.auditService.log({
      user: patient.user,
      accion: 'CANCEL_APPOINTMENT',
      pacienteId: String(patient.id),
      detalles: `Cita ${appointment.id} cancelada`,
    });

    return saved;
  }

  async findDoctorSchedule(userId: number, date?: string) {
    const doctor = await this.getDoctorByUser(userId);
    const qb = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .where('appointment.doctorId = :doctorId', { doctorId: doctor.id })
      .orderBy('appointment.fechaHoraInicio', 'ASC');

    if (date) {
      const { start, end } = this.getDayRange(date);
      qb.andWhere('appointment.fechaHoraInicio >= :start AND appointment.fechaHoraInicio < :end', { start, end });
    }

    return qb.getMany();
  }

  async confirm(userId: number, appointmentId: number) {
    const { doctor, appointment } = await this.getDoctorAppointment(userId, appointmentId);

    if (![AppointmentStatus.PENDING, AppointmentStatus.RESCHEDULED].includes(appointment.estado)) {
      throw new BadRequestException('Solo se pueden confirmar citas pendientes o reprogramadas');
    }

    appointment.estado = AppointmentStatus.CONFIRMED;
    const saved = await this.appointmentsRepository.save(appointment);
    await this.auditService.log({
      user: doctor.user,
      accion: 'CONFIRM_APPOINTMENT',
      pacienteId: String(appointment.patientId),
      detalles: `Cita ${appointment.id} confirmada`,
    });

    return saved;
  }

  async reschedule(userId: number, appointmentId: number, dto: RescheduleAppointmentDto) {
    const { doctor, appointment } = await this.getDoctorAppointment(userId, appointmentId);

    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(appointment.estado)) {
      throw new BadRequestException('Esta cita ya no se puede reprogramar');
    }

    const { start, end } = await this.validateSlot(doctor.id, dto.fechaHoraInicio, appointment.id);
    appointment.fechaHoraInicio = start;
    appointment.fechaHoraFin = end;
    appointment.estado = AppointmentStatus.RESCHEDULED;
    const saved = await this.appointmentsRepository.save(appointment);

    await this.auditService.log({
      user: doctor.user,
      accion: 'RESCHEDULE_APPOINTMENT',
      pacienteId: String(appointment.patientId),
      detalles: `Cita ${appointment.id} reprogramada para ${start.toISOString()}`,
    });

    return saved;
  }

  async complete(userId: number, appointmentId: number) {
    const { doctor, appointment } = await this.getDoctorAppointment(userId, appointmentId);

    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(appointment.estado)) {
      throw new BadRequestException('Esta cita ya fue cerrada');
    }

    appointment.estado = AppointmentStatus.COMPLETED;
    const saved = await this.appointmentsRepository.save(appointment);
    await this.auditService.log({
      user: doctor.user,
      accion: 'COMPLETE_APPOINTMENT',
      pacienteId: String(appointment.patientId),
      detalles: `Cita ${appointment.id} completada`,
    });

    return saved;
  }

  async findAllForAdmin(estado?: string) {
    const where: any = {};
    if (estado) {
      if (!Object.values(AppointmentStatus).includes(estado as AppointmentStatus)) {
        throw new BadRequestException('Estado de cita inválido');
      }
      where.estado = estado;
    }

    return this.appointmentsRepository.find({
      where,
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
      order: { fechaHoraInicio: 'DESC' },
      take: 300,
    });
  }

  async findAvailableDoctors() {
    const doctors = await this.doctorsRepository.find({
      where: { validadoPorAdmin: true, user: { status: UserStatus.ACTIVE } },
      relations: ['user', 'availability'],
      order: { id: 'ASC' },
    });

    return doctors.map((doctor) => ({
      id: doctor.id,
      nombre: doctor.user?.nombre,
      email: doctor.user?.email,
      especialidad: doctor.especialidad,
      cedulaProfesional: doctor.cedulaProfesional,
      availability: this.sortAvailability(doctor.availability || []),
    }));
  }

  async findDoctorSlots(doctorId: number, date: string) {
    await this.getValidatedDoctor(doctorId);
    const { dayStart } = this.parseDateOnly(date);
    const diaSemana = dayStart.getDay();

    const availabilities = await this.availabilityRepository.find({
      where: { doctorId, diaSemana, activo: true },
      order: { horaInicio: 'ASC' },
    });

    if (!availabilities.length) return [];

    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const occupied = await this.appointmentsRepository.find({
      where: {
        doctorId,
        estado: In(ACTIVE_APPOINTMENT_STATUSES),
      },
    });

    const occupiedStarts = new Set(
      occupied
        .filter((appointment) => appointment.fechaHoraInicio >= dayStart && appointment.fechaHoraInicio < dayEnd)
        .map((appointment) => appointment.fechaHoraInicio.getTime()),
    );

    const now = new Date();
    const slots: Array<{ fechaHoraInicio: string; fechaHoraFin: string; label: string; disponible: boolean }> = [];

    for (const availability of availabilities) {
      let current = this.combineDateAndTime(dayStart, availability.horaInicio);
      const availabilityEnd = this.combineDateAndTime(dayStart, availability.horaFin);

      while (this.addMinutes(current, APPOINTMENT_MINUTES) <= availabilityEnd) {
        const slotEnd = this.addMinutes(current, APPOINTMENT_MINUTES);
        if (current > now && !occupiedStarts.has(current.getTime())) {
          slots.push({
            fechaHoraInicio: this.toLocalInputValue(current),
            fechaHoraFin: this.toLocalInputValue(slotEnd),
            label: `${this.timeLabel(current)} - ${this.timeLabel(slotEnd)}`,
            disponible: true,
          });
        }
        current = slotEnd;
      }
    }

    return slots;
  }

  async findMyAvailability(userId: number) {
    const doctor = await this.getDoctorByUser(userId);
    const availability = await this.availabilityRepository.find({
      where: { doctorId: doctor.id },
      order: { diaSemana: 'ASC', horaInicio: 'ASC' },
    });
    return this.sortAvailability(availability);
  }

  async updateMyAvailability(userId: number, dto: UpdateAvailabilityDto) {
    const doctor = await this.getDoctorByUser(userId);

    for (const item of dto.items) {
      if (this.normalizeTime(item.horaInicio) >= this.normalizeTime(item.horaFin)) {
        throw new BadRequestException('La hora de inicio debe ser menor que la hora de fin');
      }
    }

    await this.availabilityRepository.delete({ doctorId: doctor.id });

    const rows = dto.items.map((item) => this.availabilityRepository.create({
      doctorId: doctor.id,
      diaSemana: item.diaSemana,
      horaInicio: this.normalizeTime(item.horaInicio),
      horaFin: this.normalizeTime(item.horaFin),
      activo: item.activo ?? true,
    }));

    const saved = await this.availabilityRepository.save(rows);
    return this.sortAvailability(saved);
  }

  private async validateSlot(doctorId: number, fechaHoraInicio: string, ignoreAppointmentId?: number) {
    const start = new Date(fechaHoraInicio);
    if (Number.isNaN(start.getTime())) {
      throw new BadRequestException('Fecha de cita inválida');
    }
    if (start <= new Date()) {
      throw new BadRequestException('No se pueden agendar citas en fechas pasadas');
    }

    const end = this.addMinutes(start, APPOINTMENT_MINUTES);
    const startTime = this.timeLabel(start);
    const endTime = this.timeLabel(end);

    const availability = await this.availabilityRepository.find({
      where: { doctorId, diaSemana: start.getDay(), activo: true },
    });

    const insideAvailability = availability.some((item) => (
      this.normalizeTime(item.horaInicio) <= startTime && this.normalizeTime(item.horaFin) >= endTime
    ));

    if (!insideAvailability) {
      throw new BadRequestException('El horario seleccionado no está dentro de la disponibilidad del médico');
    }

    const conflictQb = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .where('appointment.doctorId = :doctorId', { doctorId })
      .andWhere('appointment.estado IN (:...statuses)', { statuses: ACTIVE_APPOINTMENT_STATUSES })
      .andWhere(new Brackets((qb) => {
        qb.where('appointment.fechaHoraInicio < :end AND appointment.fechaHoraFin > :start', { start, end });
      }));

    if (ignoreAppointmentId) {
      conflictQb.andWhere('appointment.id != :ignoreAppointmentId', { ignoreAppointmentId });
    }

    const conflict = await conflictQb.getOne();
    if (conflict) {
      throw new BadRequestException('El médico ya tiene una cita reservada en ese horario');
    }

    return { start, end };
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

  private async getValidatedDoctor(doctorId: number) {
    const doctor = await this.doctorsRepository.findOne({
      where: { id: doctorId },
      relations: ['user'],
    });

    if (!doctor || !doctor.validadoPorAdmin || doctor.user?.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('El médico seleccionado no está disponible para agendar citas');
    }

    return doctor;
  }

  private async getDoctorAppointment(userId: number, appointmentId: number) {
    const doctor = await this.getDoctorByUser(userId);
    const appointment = await this.findOneWithRelations(appointmentId);

    if (appointment.doctorId !== doctor.id) {
      throw new ForbiddenException('Solo puedes gestionar citas asignadas a tu perfil médico');
    }

    return { doctor, appointment };
  }

  private async findOneWithRelations(id: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'patient.user', 'doctor', 'doctor.user'],
    });
    if (!appointment) throw new NotFoundException('Cita no encontrada');
    return appointment;
  }

  private parseDateOnly(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || '')) {
      throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
    }
    const dayStart = new Date(`${date}T00:00:00`);
    if (Number.isNaN(dayStart.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }
    return { dayStart };
  }

  private getDayRange(date: string) {
    const { dayStart } = this.parseDateOnly(date);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return { start: dayStart, end: dayEnd };
  }

  private combineDateAndTime(date: Date, time: string) {
    const [hours, minutes] = this.normalizeTime(time).split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  private addMinutes(date: Date, minutes: number) {
    return new Date(date.getTime() + minutes * 60 * 1000);
  }

  private normalizeTime(time: string) {
    return (time || '').slice(0, 5);
  }

  private timeLabel(date: Date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private toLocalInputValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${this.timeLabel(date)}`;
  }

  private sortAvailability(items: DoctorAvailability[]) {
    return [...items].sort((a, b) => a.diaSemana - b.diaSemana || this.normalizeTime(a.horaInicio).localeCompare(this.normalizeTime(b.horaInicio)));
  }

  private formatDateTime(date: Date) {
    return `${date.toLocaleDateString('es-MX')} ${this.timeLabel(date)}`;
  }
}
