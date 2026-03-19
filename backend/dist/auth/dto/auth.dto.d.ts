import { UserRole } from '../../entities/user.entity';
export declare class RegisterDto {
    nombre: string;
    email: string;
    password: string;
    role?: UserRole;
}
export declare class LoginDto {
    email: string;
    password: string;
}
