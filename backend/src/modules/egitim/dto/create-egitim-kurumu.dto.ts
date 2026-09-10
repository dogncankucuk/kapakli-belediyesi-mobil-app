import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export const EGITIM_TURLERI = ['Lise', 'Ortaokul', 'İlkokul'] as const;

export class CreateEgitimKurumuDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsIn(EGITIM_TURLERI)
  tur: (typeof EGITIM_TURLERI)[number];

  @IsOptional()
  @IsString()
  adres?: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
