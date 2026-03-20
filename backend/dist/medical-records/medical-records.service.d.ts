import { Repository } from 'typeorm';
import { MedicalRecord } from '../entities/medical-record.entity';
import { Patient } from '../entities/patient.entity';
import { Doctor } from '../entities/doctor.entity';
export declare class MedicalRecordsService {
    private recordsRepository;
    private patientsRepository;
    private doctorsRepository;
    constructor(recordsRepository: Repository<MedicalRecord>, patientsRepository: Repository<Patient>, doctorsRepository: Repository<Doctor>);
    create(data: {
        patientId: string;
        doctorId: string;
        fecha: string;
        motivo: string;
        diagnostico?: string;
        tratamiento?: string;
        observaciones?: string;
    }): Promise<MedicalRecord>;
    findByPatient(patientId: string): Promise<MedicalRecord[]>;
    findByUserId(userId: string): Promise<MedicalRecord[]>;
    findOne(id: string): Promise<MedicalRecord>;
}
