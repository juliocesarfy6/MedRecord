import { Transform } from 'class-transformer';
import { IsDateString, IsEmail, IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
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
  @ValidateIf((dto: RegisterDto) => dto.role !== UserRole.DOCTOR)
  @IsNotEmpty({ message: 'La fecha de nacimiento es requerida para pacientes' })
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser válida' })
  fecha_nacimiento?: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @ValidateIf((dto: RegisterDto) => dto.role !== UserRole.DOCTOR)
  @IsNotEmpty({ message: 'El sexo es requerido para pacientes' })
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
  @ValidateIf((dto: RegisterDto) => dto.role !== UserRole.ADMIN)
  @IsNotEmpty({ message: 'La CURP es requerida' })
  @Matches(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/, { message: 'La CURP no tiene un formato válido' })
  curp?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || undefined : value)
  @ValidateIf((dto: RegisterDto) => dto.role === UserRole.DOCTOR)
  @IsNotEmpty({ message: 'La especialidad es requerida para médicos' })
  @IsString()
  @MaxLength(100)
  especialidad?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() || undefined : value)
  @ValidateIf((dto: RegisterDto) => dto.role === UserRole.DOCTOR)
  @IsNotEmpty({ message: 'La cédula profesional es requerida para médicos' })
  @Matches(/^[A-Z0-9-]{5,50}$/, { message: 'La cédula profesional no tiene un formato válido' })
  cedulaProfesional?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
