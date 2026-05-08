import { Transform, Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class CreateAppointmentDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  doctorId: number;

  @IsDateString()
  fechaHoraInicio: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  motivo: string;

  @IsOptional()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(1000)
  notas?: string;
}
