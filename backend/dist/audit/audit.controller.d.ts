import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(): Promise<import("../entities/audit-log.entity").AuditLog[]>;
    myLogs(req: any): Promise<import("../entities/audit-log.entity").AuditLog[]>;
    byPatient(patientId: string): Promise<import("../entities/audit-log.entity").AuditLog[]>;
}
