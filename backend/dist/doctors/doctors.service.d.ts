import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { AuditService } from '../audit/audit.service';
export declare class DoctorsService {
    private readonly doctorRepository;
    private readonly auditService;
    constructor(doctorRepository: Repository<Doctor>, auditService: AuditService);
    validateDoctor(doctorId: string, adminId: number): Promise<{
        message: string;
        doctor: Doctor;
    }>;
}
