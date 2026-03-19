import { Patient } from './patient.entity';
import { AuditLog } from './audit-log.entity';
export declare enum UserRole {
    PATIENT = "paciente",
    DOCTOR = "medico",
    ADMIN = "admin"
}
export declare enum UserStatus {
    ACTIVE = "activo",
    INACTIVE = "inactivo",
    PENDING = "pendiente"
}
export declare class User {
    id: string;
    nombre: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    patient: Patient;
    auditLogs: AuditLog[];
}
