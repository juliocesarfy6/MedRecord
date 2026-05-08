import { Repository } from 'typeorm';
import { Token } from '../entities/token.entity';
import { Patient } from '../entities/patient.entity';
type TokenEstado = 'activo' | 'usado' | 'expirado' | 'revocado';
export declare class TokensService {
    private tokensRepository;
    private patientRepository;
    constructor(tokensRepository: Repository<Token>, patientRepository: Repository<Patient>);
    generateToken(userId: number, data: any): Promise<{
        id: number;
        token: string;
        nivelAcceso: string;
        descripcion: string;
        createdAt: Date;
        fechaExpiracion: Date;
        expiresAt: Date;
        isUsed: boolean;
        usedByUserId: number | null;
        revokedAt: Date | null;
        estado: TokenEstado;
    }>;
    validateToken(doctorUserId: number, pin: string): Promise<{
        message: string;
        patientId: number;
        nivelAcceso: string;
    }>;
    getMyTokens(userId: number): Promise<{
        id: number;
        token: string;
        nivelAcceso: string;
        descripcion: string;
        createdAt: Date;
        fechaExpiracion: Date;
        expiresAt: Date;
        isUsed: boolean;
        usedByUserId: number | null;
        revokedAt: Date | null;
        estado: TokenEstado;
    }[]>;
    revokeToken(userId: number, tokenId: number): Promise<{
        id: number;
        token: string;
        nivelAcceso: string;
        descripcion: string;
        createdAt: Date;
        fechaExpiracion: Date;
        expiresAt: Date;
        isUsed: boolean;
        usedByUserId: number | null;
        revokedAt: Date | null;
        estado: TokenEstado;
    }>;
    private generateUniquePin;
    private getEstado;
    private toResponse;
    hasDoctorAccess(doctorUserId: number, patientId: number): Promise<boolean>;
    findAuthorizedPatientIds(doctorUserId: number): Promise<number[]>;
}
export {};
