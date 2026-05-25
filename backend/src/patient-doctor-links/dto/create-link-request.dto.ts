import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateLinkRequestDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  doctorId: number;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  message?: string;
}
