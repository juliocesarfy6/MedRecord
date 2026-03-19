import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: string;
        nombre: string;
        email: string;
        role: import("../entities/user.entity").UserRole;
        status: import("../entities/user.entity").UserStatus;
        createdAt: Date;
        patient: import("../entities/patient.entity").Patient;
        auditLogs: import("../entities/audit-log.entity").AuditLog[];
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            nombre: string;
            email: string;
            role: import("../entities/user.entity").UserRole;
            status: import("../entities/user.entity").UserStatus.ACTIVE;
        };
    }>;
    getProfile(req: any): Promise<{
        id: string;
        nombre: string;
        email: string;
        role: import("../entities/user.entity").UserRole;
        status: import("../entities/user.entity").UserStatus;
        createdAt: Date;
        patient: import("../entities/patient.entity").Patient;
        auditLogs: import("../entities/audit-log.entity").AuditLog[];
    }>;
}
