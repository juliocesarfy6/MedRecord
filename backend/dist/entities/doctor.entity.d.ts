import { User } from './user.entity';
import { MedicalRecord } from './medical-record.entity';
export declare class Doctor {
    id: number;
    userId: number;
    especialidad: string;
    cedulaProfesional: string;
    validadoPorAdmin: boolean;
    fechaValidacion: Date;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    medicalRecords: MedicalRecord[];
}
