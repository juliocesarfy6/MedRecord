import { TokensService } from './tokens.service';
export declare class TokensController {
    private readonly tokensService;
    constructor(tokensService: TokensService);
    generate(req: any, body: any): Promise<import("../entities/token.entity").Token>;
    validate(token: string): Promise<{
        valid: boolean;
        patientId: string;
        nivelAcceso: import("../entities/token.entity").AccessLevel;
        patient: import("../entities/patient.entity").Patient;
    }>;
    getMyTokens(req: any): Promise<import("../entities/token.entity").Token[]>;
    revoke(id: string, req: any): Promise<import("../entities/token.entity").Token>;
}
