import { Patient } from './patient.entity';
export declare enum TokenStatus {
    ACTIVE = "activo",
    EXPIRED = "expirado",
    REVOKED = "revocado"
}
export declare enum AccessLevel {
    READ = "lectura",
    FULL = "completo"
}
export declare class Token {
    id: string;
    token: string;
    nivelAcceso: AccessLevel;
    estado: TokenStatus;
    fechaExpiracion: Date;
    descripcion: string;
    patient: Patient;
    createdAt: Date;
}
