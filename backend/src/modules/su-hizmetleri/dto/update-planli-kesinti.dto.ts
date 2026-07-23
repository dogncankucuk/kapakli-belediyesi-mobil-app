import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePlanliKesintiDto {
  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ilce?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  aciklama?: string;
}
