import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
export declare class MedicalRecordsService {
    private recordsRepository;
    private doctorRepository;
    private patientRepository;
    private auditService;
    constructor(recordsRepository: Repository<MedicalRecord>, doctorRepository: Repository<Doctor>, patientRepository: Repository<Patient>, auditService: AuditService);
    createRecord(userId: number, createDto: CreateMedicalRecordDto): Promise<MedicalRecord>;
    getMyRecords(userId: number): Promise<MedicalRecord[]>;
}
