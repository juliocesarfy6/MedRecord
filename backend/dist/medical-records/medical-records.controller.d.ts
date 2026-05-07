import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
export declare class MedicalRecordsController {
    private readonly recordsService;
    constructor(recordsService: MedicalRecordsService);
    create(req: any, createDto: CreateMedicalRecordDto): Promise<import("../entities/medical-record.entity").MedicalRecord>;
    getMyRecords(req: any): Promise<import("../entities/medical-record.entity").MedicalRecord[]>;
}
