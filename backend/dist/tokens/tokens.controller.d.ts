import { TokensService } from './tokens.service';
export declare class TokensController {
    private readonly tokensService;
    constructor(tokensService: TokensService);
    generateToken(req: any, data: any): Promise<{
        token: string;
    }>;
    validateToken(token: string): Promise<{
        message: string;
        patientId: number;
        nivelAcceso: string;
    }>;
    getMyTokens(req: any): Promise<import("../entities/token.entity").Token[]>;
}
