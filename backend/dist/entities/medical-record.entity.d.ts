import { Patient } from './patient.entity';
import { Doctor } from './doctor.entity';
export declare class MedicalRecord {
    id: number;
    patientId: number;
    doctorId: number;
    fecha: Date;
    motivo: string;
    diagnostico: string;
    tratamiento: string;
    observaciones: string;
    createdAt: Date;
    updatedAt: Date;
    patient: Patient;
    doctor: Doctor;
}
