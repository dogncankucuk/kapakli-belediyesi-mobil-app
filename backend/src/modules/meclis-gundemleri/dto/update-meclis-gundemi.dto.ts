import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMeclisGundemiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baslik?: string;

  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @IsString()
  dosyaUrl?: string;
}
