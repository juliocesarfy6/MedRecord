import { Patient } from './patient.entity';
import { User } from './user.entity';
export declare class MedicalRecord {
    id: string;
    fecha: Date;
    motivo: string;
    diagnostico: string;
    tratamiento: string;
    observaciones: string;
    medicamentos: string;
    patient: Patient;
    doctor: User;
    createdAt: Date;
}
