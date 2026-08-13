import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

// Kaynak: Kapakli Belediyesi GiSoftGis CBS sistemi (poi entity,
// poiGroupLevel3_name kategorileri) - "Atik Getirme Araci" haric tutuldu,
// cunku bu sabit bir nokta degil, gezici bir arac.
export const ATIK_TURLERI = [
  'Kağıt/Karton/Plastik/Metal',
  'Elektronik (AEEE)',
  'Tekstil',
  'Cam',
  'Pil',
  'Atık Getirme Merkezi',
  'İlaç',
  'Bitkisel Yağ',
  'Zirai İlaç Kutusu',
] as const;

export class CreateAtikNoktasiDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsIn(ATIK_TURLERI)
  tur: (typeof ATIK_TURLERI)[number];

  @IsOptional()
  @IsString()
  adres?: string;

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
