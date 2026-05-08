import { TokensService } from './tokens.service';
export declare class TokensController {
    private readonly tokensService;
    constructor(tokensService: TokensService);
    generateToken(req: any, data: any): Promise<{
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
        estado: "activo" | "usado" | "expirado" | "revocado";
    }>;
    validateToken(req: any, token: string): Promise<{
        message: string;
        patientId: number;
        nivelAcceso: string;
    }>;
    getMyTokens(req: any): Promise<{
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
        estado: "activo" | "usado" | "expirado" | "revocado";
    }[]>;
    revokeToken(req: any, id: string): Promise<{
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
        estado: "activo" | "usado" | "expirado" | "revocado";
    }>;
}
