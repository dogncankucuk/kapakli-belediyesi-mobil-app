import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export const WIFI_KATEGORILERI = ['parklar', 'meydanlar'] as const;

export class CreateWifiNoktasiDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsString()
  @IsNotEmpty()
  adres: string;

  @IsIn(WIFI_KATEGORILERI)
  kategori: (typeof WIFI_KATEGORILERI)[number];

  @IsLatitude()
  lat: number;

  @IsLongitude()
  lng: number;
}
