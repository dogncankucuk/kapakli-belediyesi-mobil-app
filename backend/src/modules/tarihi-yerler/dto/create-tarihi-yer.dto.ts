import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export const TARIHI_YER_TURLERI = [
  'Anıt',
  'Höyük / Tümülüs',
  'Tarihi Taş',
  'Tarihi Yer',
] as const;

export class CreateTarihiYerDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsIn(TARIHI_YER_TURLERI)
  tur: (typeof TARIHI_YER_TURLERI)[number];

  @IsOptional()
  @IsString()
  adres?: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
