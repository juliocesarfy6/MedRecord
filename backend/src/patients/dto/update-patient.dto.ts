import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdatePatientDto {
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser válida' })
  @IsOptional()
  fechaNacimiento?: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsIn(['masculino', 'femenino', 'otro'], { message: 'El sexo no es válido' })
  @IsOptional()
  sexo?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() || undefined : value)
  @Matches(/^[0-9+\-\s()]{7,20}$/, { message: 'El teléfono no tiene un formato válido' })
  @IsOptional()
  telefono?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() || undefined : value)
  @Matches(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[A-Z0-9][0-9]$/, { message: 'La CURP no tiene un formato válido' })
  @IsOptional()
  curp?: string;

  @Transform(({ value }) => value === '' ? undefined : value)
  @IsIn(['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], { message: 'El grupo sanguíneo no es válido' })
  @IsOptional()
  grupoSanguineo?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(1000, { message: 'Las alergias no pueden exceder 1000 caracteres' })
  @IsOptional()
  alergias?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(255, { message: 'La dirección no puede exceder 255 caracteres' })
  @IsOptional()
  direccion?: string;
}
