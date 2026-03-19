import { MedicalRecordsService } from './medical-records.service';
export declare class MedicalRecordsController {
    private readonly service;
    constructor(service: MedicalRecordsService);
    create(body: any, req: any): Promise<import("../entities/medical-record.entity").MedicalRecord>;
    getMyRecords(req: any): Promise<import("../entities/medical-record.entity").MedicalRecord[]>;
    findByPatient(patientId: string): Promise<import("../entities/medical-record.entity").MedicalRecord[]>;
    findOne(id: string): Promise<import("../entities/medical-record.entity").MedicalRecord>;
}
