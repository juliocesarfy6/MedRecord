import { DoctorsService } from './doctors.service';
export declare class DoctorsController {
    private readonly doctorsService;
    constructor(doctorsService: DoctorsService);
    validateDoctor(doctorId: string, req: any): Promise<{
        message: string;
        doctor: import("../entities/doctor.entity").Doctor;
    }>;
}
