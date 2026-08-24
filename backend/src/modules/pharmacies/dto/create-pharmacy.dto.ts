import {
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePharmacyDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsString()
  @IsNotEmpty()
  adres: string;

  @IsOptional()
  @IsString()
  adresTarifi?: string;

  @IsString()
  @IsNotEmpty()
  telefon: string;

  @IsDateString()
  nobetTarihi: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
