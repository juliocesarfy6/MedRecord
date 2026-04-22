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

        // 👇 Corregido a camelCase
        if (doctor.validadoPorAdmin) throw new BadRequestException('El médico ya estaba validado');

        // 👇 Corregido a camelCase
        doctor.validadoPorAdmin = true;
        doctor.fechaValidacion = new Date();

        const updatedDoctor = await this.doctorRepository.save(doctor);

        this.auditService.log({
            accion: 'VALIDATE_DOCTOR',
            // 👇 Corregido a camelCase
            detalles: `El Admin ID ${adminId} validó al Médico ID ${doctor.id} (${doctor.cedulaProfesional})`,
        }).catch(console.error);

        return {
            message: 'Médico validado exitosamente',
            doctor: updatedDoctor,
        };
    }
}