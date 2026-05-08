import { Type, Transform } from 'class-transformer';
import { IsDateString, IsString, IsNotEmpty, IsOptional, IsInt, MaxLength, Min, MinLength } from 'class-validator';

export class CreateMedicalRecordDto {
    @Type(() => Number)
    @IsInt({ message: 'El ID del paciente debe ser un número entero' })
    @Min(1, { message: 'El ID del paciente no es válido' })
    @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
    patientId!: number;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty({ message: 'El motivo de la consulta es obligatorio' })
    @MinLength(3, { message: 'El motivo debe tener al menos 3 caracteres' })
    @MaxLength(255, { message: 'El motivo no puede exceder 255 caracteres' })
    motivoConsulta!: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty({ message: 'El diagnóstico es obligatorio' })
    @MinLength(3, { message: 'El diagnóstico debe tener al menos 3 caracteres' })
    @MaxLength(2000, { message: 'El diagnóstico no puede exceder 2000 caracteres' })
    diagnostico!: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty({ message: 'El tratamiento es obligatorio' })
    @MinLength(3, { message: 'El tratamiento debe tener al menos 3 caracteres' })
    @MaxLength(2000, { message: 'El tratamiento no puede exceder 2000 caracteres' })
    tratamiento!: string;

    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @MaxLength(2000, { message: 'Las observaciones no pueden exceder 2000 caracteres' })
    @IsOptional()
    observaciones?: string;

    @IsDateString({}, { message: 'La fecha de consulta debe ser una fecha válida' })
    @IsOptional()
    fecha?: string;
}
