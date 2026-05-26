import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateDoctorProfileDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() || undefined : value)
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || undefined : value)
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'La especialidad no puede exceder 100 caracteres' })
  especialidad?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() || undefined : value)
  @IsOptional()
  @Matches(/^[A-Z0-9-]{5,50}$/, { message: 'La cédula profesional no tiene un formato válido' })
  cedulaProfesional?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() || undefined : value)
  @IsOptional()
  @Matches(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/, { message: 'La CURP no tiene un formato válido' })
  curp?: string;
}
