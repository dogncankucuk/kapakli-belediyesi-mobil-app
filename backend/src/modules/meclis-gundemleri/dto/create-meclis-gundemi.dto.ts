import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMeclisGundemiDto {
  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsDateString()
  tarih: string;

  @IsOptional()
  @IsString()
  dosyaUrl?: string;
}
