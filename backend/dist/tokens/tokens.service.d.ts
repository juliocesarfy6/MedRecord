import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';
export declare class TokensService {
    private tokensRepository;
    private patientRepository;
    constructor(tokensRepository: Repository<Token>, patientRepository: Repository<Patient>);
    generateToken(userId: number, data: any): Promise<{
        token: string;
    }>;
    validateToken(pin: string): Promise<{
        message: string;
        patientId: number;
        nivelAcceso: string;
    }>;
    getMyTokens(userId: number): Promise<Token[]>;
}
