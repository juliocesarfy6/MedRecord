import { UserRole } from '../../entities/user.entity';
export declare class RegisterDto {
    nombre: string;
    email: string;
    password: string;
    role?: UserRole;
    fecha_nacimiento?: string;
    sexo?: string;
    telefono?: string;
    direccion?: string;
    curp?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
