import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { MedicalRecord } from '../entities/medical-record.entity';
export declare class TokensService {
    private tokensRepository;
    private recordsRepository;
    constructor(tokensRepository: Repository<Token>, recordsRepository: Repository<MedicalRecord>);
    generatePin(recordId: number): Promise<Token>;
    validatePin(pin: string): Promise<{
        message: string;
        medicalRecord: MedicalRecord;
    }>;
}
