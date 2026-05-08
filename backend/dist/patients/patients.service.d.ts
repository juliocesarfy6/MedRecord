import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service';
import { TokensService } from '../tokens/tokens.service';
export declare class PatientsService {
    private patientsRepository;
    private auditService;
    private tokensService;
    constructor(patientsRepository: Repository<Patient>, auditService: AuditService, tokensService: TokensService);
    findAll(): Promise<Patient[]>;
    findOne(id: string): Promise<Patient>;
    findOneForUser(id: string, user: any): Promise<Patient>;
    findAuthorizedForDoctor(userId: number): Promise<Patient[]>;
    findByUserId(userId: string): Promise<Patient>;
    update(id: string, data: Partial<Patient>): Promise<Patient>;
    updateByUserId(userId: string, data: Partial<Patient>): Promise<Patient>;
}
