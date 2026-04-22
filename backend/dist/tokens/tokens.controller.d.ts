import { TokensService } from './tokens.service';
export declare class TokensController {
    private readonly tokensService;
    constructor(tokensService: TokensService);
    generatePin(recordId: number): Promise<import("../entities/token.entity").Token>;
    validatePin(pin: string): Promise<{
        message: string;
        medicalRecord: import("../entities/medical-record.entity").MedicalRecord;
    }>;
}
