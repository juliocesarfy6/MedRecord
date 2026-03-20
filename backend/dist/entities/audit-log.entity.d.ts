import { User } from './user.entity';
import { Patient } from './patient.entity';
export declare class AuditLog {
    id: number;
    userId: number;
    patientId: number;
    accion: string;
    detalles: string;
    ip: string;
    fecha: Date;
    user: User;
    patient: Patient;
}
