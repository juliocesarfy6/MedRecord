import { Patient } from './patient.entity';
export declare enum TokenStatus {
    ACTIVE = "activo",
    EXPIRED = "expirado",
    REVOKED = "revocado"
}
export declare enum AccessLevel {
    READ = "lectura",
    EDIT = "edicion"
}
export declare class Token {
    id: number;
    token: string;
    patientId: number;
    nivelAcceso: AccessLevel;
    estado: TokenStatus;
    fechaExpiracion: Date;
    createdAt: Date;
    updatedAt: Date;
    patient: Patient;
}
