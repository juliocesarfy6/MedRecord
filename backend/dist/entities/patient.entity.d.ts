import { User } from './user.entity';
import { MedicalRecord } from './medical-record.entity';
import { Token } from './token.entity';
export declare class Patient {
    id: string;
    curp: string;
    fechaNacimiento: Date;
    sexo: string;
    telefono: string;
    direccion: string;
    grupoSanguineo: string;
    alergias: string;
    user: User;
    medicalRecords: MedicalRecord[];
    tokens: Token[];
}
