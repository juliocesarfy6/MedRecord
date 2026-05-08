import { Transform } from 'class-transformer';
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMedicalRecordDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(3, { message: 'El motivo debe tener al menos 3 caracteres' })
  @MaxLength(255, { message: 'El motivo no puede exceder 255 caracteres' })
  @IsOptional()
  motivoConsulta?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(3, { message: 'El diagnóstico debe tener al menos 3 caracteres' })
  @MaxLength(2000, { message: 'El diagnóstico no puede exceder 2000 caracteres' })
  @IsOptional()
  diagnostico?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(3, { message: 'El tratamiento debe tener al menos 3 caracteres' })
  @MaxLength(2000, { message: 'El tratamiento no puede exceder 2000 caracteres' })
  @IsOptional()
  tratamiento?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(2000, { message: 'Las observaciones no pueden exceder 2000 caracteres' })
  @IsOptional()
  observaciones?: string;

  @IsDateString({}, { message: 'La fecha de consulta debe ser una fecha válida' })
  @IsOptional()
  fecha?: string;
}
