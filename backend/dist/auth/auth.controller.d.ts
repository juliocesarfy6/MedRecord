import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: number;
        nombre: string;
        email: string;
        role: import("../entities/user.entity").UserRole;
        status: import("../entities/user.entity").UserStatus;
        createdAt: Date;
        updatedAt: Date;
        patient: import("../entities/patient.entity").Patient;
        doctor: import("../entities/doctor.entity").Doctor;
        auditLogs: import("../entities/audit-log.entity").AuditLog[];
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            nombre: string;
            email: string;
            role: import("../entities/user.entity").UserRole;
            status: import("../entities/user.entity").UserStatus.ACTIVE;
        };
    }>;
    getProfile(req: any): Promise<{
        id: number;
        nombre: string;
        email: string;
        role: import("../entities/user.entity").UserRole;
        status: import("../entities/user.entity").UserStatus;
        createdAt: Date;
        updatedAt: Date;
        patient: import("../entities/patient.entity").Patient;
        doctor: import("../entities/doctor.entity").Doctor;
        auditLogs: import("../entities/audit-log.entity").AuditLog[];
    }>;
}
