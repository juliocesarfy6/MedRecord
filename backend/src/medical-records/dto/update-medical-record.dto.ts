import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMedicalRecordDto {
  @IsString()
  @IsOptional()
  motivoConsulta?: string;

  @IsString()
  @IsOptional()
  diagnostico?: string;

  @IsString()
  @IsOptional()
  tratamiento?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsDateString({}, { message: 'La fecha de consulta debe ser una fecha válida' })
  @IsOptional()
  fecha?: string;
}
