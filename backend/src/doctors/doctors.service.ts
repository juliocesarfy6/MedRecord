import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { AuditService } from '../audit/audit.service';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class DoctorsService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        private readonly auditService: AuditService,
    ) { }

    async getMyProfile(userId: number) {
        const doctor = await this.findDoctorByUserOrFail(userId);
        return this.toProfileResponse(doctor);
    }

    async updateMyProfile(userId: number, dto: UpdateDoctorProfileDto) {
        const doctor = await this.findDoctorByUserOrFail(userId);

        if (dto.curp && dto.curp !== doctor.curp) {
            const existingDoctorCurp = await this.doctorRepository.findOne({ where: { curp: dto.curp, id: Not(doctor.id) } });
            if (existingDoctorCurp) throw new ConflictException('La CURP ya está registrada para otro médico');

            const existingPatientCurp = await this.patientRepository.findOne({ where: { curp: dto.curp } });
            if (existingPatientCurp) throw new ConflictException('La CURP ya está registrada');

            doctor.curp = dto.curp;
        }

        if (dto.cedulaProfesional && dto.cedulaProfesional !== doctor.cedulaProfesional) {
            const existingCedula = await this.doctorRepository.findOne({ where: { cedulaProfesional: dto.cedulaProfesional, id: Not(doctor.id) } });
            if (existingCedula) throw new ConflictException('La cédula profesional ya está registrada');
            doctor.cedulaProfesional = dto.cedulaProfesional;
        }

        if (dto.especialidad !== undefined) doctor.especialidad = dto.especialidad;

        if (dto.nombre !== undefined && dto.nombre !== doctor.user?.nombre) {
            await this.userRepository.update({ id: userId }, { nombre: dto.nombre });
            doctor.user.nombre = dto.nombre;
        }

        const saved = await this.doctorRepository.save(doctor);

        this.auditService.log({
            user: { id: userId } as any,
            accion: 'UPDATE_DOCTOR_PROFILE',
            detalles: `El médico ID ${saved.id} actualizó su perfil profesional`,
        }).catch(console.error);

        return this.toProfileResponse(saved);
    }

    async validateDoctor(doctorId: string, adminId: number) {
        const doctor = await this.doctorRepository.findOne({
            where: { id: +doctorId },
            relations: ['user'],
        });

        if (!doctor) throw new NotFoundException('Médico no encontrado');

        if (doctor.validadoPorAdmin) throw new BadRequestException('El médico ya estaba validado');

        doctor.validadoPorAdmin = true;
        doctor.fechaValidacion = new Date();

        const updatedDoctor = await this.doctorRepository.save(doctor);

        this.auditService.log({
            user: { id: adminId } as any, // Usamos adminId porque es el que viene en los parámetros
            accion: 'VALIDATE_DOCTOR',
            detalles: `El Admin ID ${adminId} validó al Médico ID ${doctor.id} (Cédula: ${doctor.cedulaProfesional})`,
        }).catch(console.error);

        return {
            message: 'Médico validado exitosamente',
            doctor: updatedDoctor,
        };
    }

    async createProfile(userId: number, data: any) {

        const existing = await this.doctorRepository.findOne({
            where: { user: { id: userId } }
        });

        if (existing) {
            throw new BadRequestException('El médico ya tiene un perfil profesional registrado');
        }


        const newDoctor = this.doctorRepository.create({
            especialidad: data.especialidad,
            cedulaProfesional: data.cedula_profesional,
            user: { id: userId },
            validadoPorAdmin: false
        });

        const savedDoctor = await this.doctorRepository.save(newDoctor);


        this.auditService.log({
            user: { id: userId } as any,
            accion: 'CREATE_DOCTOR_PROFILE',
            detalles: `El Usuario ID ${userId} completó su perfil profesional con cédula ${data.cedula_profesional}`,
        }).catch(console.error);
    }

    private async findDoctorByUserOrFail(userId: number) {
        const doctor = await this.doctorRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!doctor) throw new NotFoundException('Perfil médico no encontrado');
        return doctor;
    }

    private toProfileResponse(doctor: Doctor) {
        return {
            id: doctor.id,
            userId: doctor.userId,
            nombre: doctor.user?.nombre,
            email: doctor.user?.email,
            status: doctor.user?.status,
            especialidad: doctor.especialidad,
            cedulaProfesional: doctor.cedulaProfesional,
            curp: doctor.curp,
            validadoPorAdmin: doctor.validadoPorAdmin,
            fechaValidacion: doctor.fechaValidacion,
            documentoCedulaNombre: doctor.documentoCedulaNombre,
            tieneDocumentoCedula: !!doctor.documentoCedulaPath,
            notasValidacion: doctor.notasValidacion,
            motivoRechazo: doctor.motivoRechazo,
        };
    }


}
