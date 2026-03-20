import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
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
    id: number;
    nombre: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
    createdAt: Date;
    updatedAt: Date;
    patient: Patient;
    doctor: Doctor;
    auditLogs: AuditLog[];
}
