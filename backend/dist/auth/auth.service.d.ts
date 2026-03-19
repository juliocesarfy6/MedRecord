import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private usersRepository;
    private patientsRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, patientsRepository: Repository<Patient>, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        id: string;
        nombre: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        createdAt: Date;
        patient: Patient;
        auditLogs: import("../entities/audit-log.entity").AuditLog[];
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            nombre: string;
            email: string;
            role: UserRole;
            status: UserStatus.ACTIVE;
        };
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        nombre: string;
        email: string;
        role: UserRole;
        status: UserStatus;
        createdAt: Date;
        patient: Patient;
        auditLogs: import("../entities/audit-log.entity").AuditLog[];
    }>;
}
