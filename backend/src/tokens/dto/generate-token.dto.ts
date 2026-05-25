import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class GenerateTokenDto {
  @Transform(({ value }) => value === undefined || value === '' ? undefined : Number(value))
  @IsInt({ message: 'Selecciona un médico válido' })
  @Min(1, { message: 'Selecciona un médico válido' })
  @IsNotEmpty({ message: 'Selecciona el médico destinatario del token' })
  doctorId: number;

  @Transform(({ value }) => value === undefined || value === '' ? undefined : Number(value))
  @IsInt({ message: 'Las horas de expiración deben ser un número entero' })
  @Min(1, { message: 'El token debe durar al menos 1 hora' })
  @Max(168, { message: 'El token no puede durar más de 1 semana' })
  @IsOptional()
  horasExpiracion?: number = 24;

  @IsIn(['lectura', 'edicion', 'lectura_escritura'], {
    message: 'El nivel de acceso no es válido',
  })
  @IsOptional()
  nivelAcceso?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
  @IsOptional()
  descripcion?: string;
}
