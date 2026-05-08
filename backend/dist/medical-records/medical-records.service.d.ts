import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { AuditService } from '../audit/audit.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
import { UpdateMedicalRecordDto } from './dto/update-medical-record.dto';
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
    findOneForDoctor(userId: number, recordId: number): Promise<MedicalRecord>;
    updateRecord(userId: number, recordId: number, updateDto: UpdateMedicalRecordDto): Promise<MedicalRecord>;
    deleteRecord(userId: number, recordId: number): Promise<{
        message: string;
    }>;
    private findDoctorOrFail;
    private findRecordOrFail;
    private ensureDoctorCanReadPatient;
    private ensureDoctorCanModifyRecord;
}
