import { Repository } from 'typeorm';
import { Token, AccessLevel } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';
export declare class TokensService {
    private tokensRepository;
    private patientsRepository;
    constructor(tokensRepository: Repository<Token>, patientsRepository: Repository<Patient>);
    generate(userId: string, data: {
        nivelAcceso: AccessLevel;
        horasExpiracion: number;
        descripcion?: string;
    }): Promise<Token>;
    validate(tokenValue: string): Promise<{
        valid: boolean;
        patientId: string;
        nivelAcceso: AccessLevel;
        patient: Patient;
    }>;
    revoke(tokenId: string, userId: string): Promise<Token>;
    findByPatient(userId: string): Promise<Token[]>;
}
