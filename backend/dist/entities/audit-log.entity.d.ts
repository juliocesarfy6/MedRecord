import { User } from './user.entity';
export declare class AuditLog {
    id: string;
    accion: string;
    recurso: string;
    ip: string;
    detalles: string;
    user: User;
    pacienteId: string;
    fecha: Date;
}
