import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUlasimHattiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hatAdi?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  guzergah?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  durum?: string;

  @IsOptional()
  @IsBoolean()
  canli?: boolean;

  @IsOptional()
  @IsString()
  hatKodu?: string;
}
