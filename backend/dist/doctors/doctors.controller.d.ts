import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    createProfile(body: any, req: any): Promise<void>;
    validateDoctor(doctorId: string, req: any): Promise<{
        message: string;
        doctor: import("../entities/doctor.entity").Doctor;
    }>;
}
