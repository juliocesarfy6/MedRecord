import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { TokensService } from '../tokens/tokens.service';
export declare class MedicalRecordsService {
    private recordsRepository;
    private doctorRepository;
    private patientRepository;
    private auditService;
    private tokensService;
    constructor(recordsRepository: Repository<MedicalRecord>, doctorRepository: Repository<Doctor>, patientRepository: Repository<Patient>, auditService: AuditService, tokensService: TokensService);
    createRecord(userId: number, createDto: CreateMedicalRecordDto): Promise<MedicalRecord>;
    getMyRecords(userId: number): Promise<MedicalRecord[]>;
    findByPatient(userId: number, patientId: number): Promise<MedicalRecord[]>;
}
