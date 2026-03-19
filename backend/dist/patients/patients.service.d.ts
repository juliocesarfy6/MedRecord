import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
export declare class PatientsService {
    private patientsRepository;
    constructor(patientsRepository: Repository<Patient>);
    findAll(): Promise<Patient[]>;
    findOne(id: string): Promise<Patient>;
    findByUserId(userId: string): Promise<Patient>;
    update(id: string, data: Partial<Patient>): Promise<Patient>;
    updateByUserId(userId: string, data: Partial<Patient>): Promise<Patient>;
}
