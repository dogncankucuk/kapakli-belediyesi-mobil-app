import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateElektrikKesintisiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mahalle?: string;

  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  aciklama?: string;
}
