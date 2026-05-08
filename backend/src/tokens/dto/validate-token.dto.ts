import { Transform } from 'class-transformer';
import { IsNotEmpty, Matches } from 'class-validator';

export class ValidateTokenDto {
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toUpperCase() : value)
  @IsNotEmpty({ message: 'Token requerido' })
  @Matches(/^[A-Z0-9]{12}$/, { message: 'El token debe tener 12 caracteres alfanuméricos' })
  token: string;
}
