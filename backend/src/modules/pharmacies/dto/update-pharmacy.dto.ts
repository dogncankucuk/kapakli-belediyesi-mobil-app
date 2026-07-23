import {
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdatePharmacyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ad?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adres?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  telefon?: string;

  @IsOptional()
  @IsDateString()
  nobetTarihi?: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;
}
