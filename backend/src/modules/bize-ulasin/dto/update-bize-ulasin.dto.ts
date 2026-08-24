import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateBizeUlasinDto {
  @IsOptional()
  @IsString()
  telefon?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  eposta?: string;

  @IsOptional()
  @IsString()
  adres?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;
}
