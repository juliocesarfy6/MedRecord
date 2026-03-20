import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { User } from '../entities/user.entity';
export declare class AuditService {
    private auditRepository;
    constructor(auditRepository: Repository<AuditLog>);
    log(data: {
        user?: User;
        accion: string;
        ip?: string;
        detalles?: string;
        pacienteId?: string;
    }): Promise<AuditLog>;
    findAll(): Promise<AuditLog[]>;
    findByUser(userId: string): Promise<AuditLog[]>;
    findByPatient(pacienteId: string): Promise<AuditLog[]>;
}
