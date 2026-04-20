import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIP } from 'class-validator';

export class CreateAuditLogDto {
    @IsString()
    @IsNotEmpty({ message: 'La acción es obligatoria (ej. CREATE, UPDATE, VIEW)' })
    action: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripción del evento es obligatoria' })
    description: string;

    @IsIP()
    @IsOptional()
    ip_address?: string;

    @IsNumber()
    @IsNotEmpty({ message: 'El ID del usuario que realiza la acción es obligatorio' })
    userId: number;

    @IsNumber()
    @IsOptional()
    patientId?: number; // Opcional, ya que no todas las acciones afectan a un paciente
}