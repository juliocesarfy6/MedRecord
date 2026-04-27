import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DoctorsService {
    constructor(
        @InjectRepository(Doctor)
        private readonly doctorRepository: Repository<Doctor>,
        private readonly auditService: AuditService,
    ) { }

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


}