import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export const SAGLIK_TURLERI = ['Hastane', 'Eczane'] as const;

export class CreateSaglikKurumuDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsIn(SAGLIK_TURLERI)
  tur: (typeof SAGLIK_TURLERI)[number];

  @IsOptional()
  @IsString()
  adres?: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
