import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export const PARK_TURLERI = ['Park', 'Bahçe'] as const;

export class CreateParkDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsIn(PARK_TURLERI)
  tur: (typeof PARK_TURLERI)[number];

  @IsOptional()
  @IsString()
  adres?: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
