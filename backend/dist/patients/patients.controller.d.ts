import { PatientsService } from './patients.service';
export declare class PatientsController {
    private readonly patientsService;
    constructor(patientsService: PatientsService);
    findAll(): Promise<import("../entities/patient.entity").Patient[]>;
    getMyProfile(req: any): Promise<import("../entities/patient.entity").Patient>;
    findOne(id: string): Promise<import("../entities/patient.entity").Patient>;
    updateMyProfile(req: any, data: any): Promise<import("../entities/patient.entity").Patient>;
    update(id: string, data: any): Promise<import("../entities/patient.entity").Patient>;
}
