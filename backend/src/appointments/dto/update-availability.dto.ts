import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, Matches, Max, Min, ValidateNested } from 'class-validator';

export class AvailabilityItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  diaSemana: number;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaInicio: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  horaFin: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityItemDto)
  items: AvailabilityItemDto[];
}
