import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service';
export declare class PatientsService {
    private patientsRepository;
    private auditService;
    constructor(patientsRepository: Repository<Patient>, auditService: AuditService);
    findAll(): Promise<Patient[]>;
    findOne(id: string): Promise<Patient>;
    findByUserId(userId: string): Promise<Patient>;
    update(id: string, data: Partial<Patient>): Promise<Patient>;
    updateByUserId(userId: string, data: Partial<Patient>): Promise<Patient>;
}
