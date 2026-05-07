import { Patient } from './patient.entity';
export declare class Token {
    id: number;
    pin: string;
    expiresAt: Date;
    isUsed: boolean;
    nivelAcceso: string;
    descripcion: string;
    createdAt: Date;
    patient: Patient;
}
