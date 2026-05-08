import { IsDateString, IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateMedicalRecordDto {
    @IsNumber({}, { message: 'El ID del paciente debe ser un número' })
    @IsNotEmpty({ message: 'El ID del paciente es obligatorio' })
    patientId!: number;

    @IsString()
    @IsNotEmpty({ message: 'El motivo de la consulta es obligatorio' })
    motivoConsulta!: string;

    @IsString()
    @IsNotEmpty({ message: 'El diagnóstico es obligatorio' })
    diagnostico!: string;

    @IsString()
    @IsNotEmpty({ message: 'El tratamiento es obligatorio' })
    tratamiento!: string;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsDateString({}, { message: 'La fecha de consulta debe ser una fecha válida' })
    @IsOptional()
    fecha?: string;
}
