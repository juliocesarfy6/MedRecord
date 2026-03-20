import { User } from './user.entity';
import { MedicalRecord } from './medical-record.entity';
import { Token } from './token.entity';
import { AuditLog } from './audit-log.entity';
export declare class Patient {
    id: number;
    userId: number;
    fechaNacimiento: Date;
    sexo: string;
    telefono: string;
    direccion: string;
    curp: string;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    medicalRecords: MedicalRecord[];
    tokens: Token[];
    auditLogs: AuditLog[];
}
