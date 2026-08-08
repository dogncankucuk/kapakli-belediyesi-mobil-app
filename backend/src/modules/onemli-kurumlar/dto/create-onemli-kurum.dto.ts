import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export const KURUM_TURLERI = [
  'Belediye',
  'Kaymakamlık',
  'Emniyet',
  'Karakol',
  'İtfaiye',
  'Sağlık',
  'PTT',
  'Diğer',
] as const;

export class CreateOnemliKurumDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsIn(KURUM_TURLERI)
  tur: (typeof KURUM_TURLERI)[number];

  @IsOptional()
  @IsString()
  adres?: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
