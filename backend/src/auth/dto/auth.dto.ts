import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  // --- Datos vitales del Paciente ---
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser válida' })
  fecha_nacimiento?: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsIn(['masculino', 'femenino', 'otro'], { message: 'El sexo no es válido' })
  sexo?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || undefined : value)
  @IsOptional()
  @Matches(/^[0-9+\-\s()]{7,20}$/, { message: 'El teléfono no tiene un formato válido' })
  telefono?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || undefined : value)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() || undefined : value)
  @IsOptional()
  @Matches(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/, { message: 'La CURP no tiene un formato válido' })
  curp?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
