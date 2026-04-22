import { MedicalRecord } from './medical-record.entity';
export declare class Token {
    id: number;
    pin: string;
    expiresAt: Date;
    isUsed: boolean;
    createdAt: Date;
    medicalRecord: MedicalRecord;
}
