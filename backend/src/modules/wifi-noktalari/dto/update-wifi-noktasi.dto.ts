import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { WIFI_KATEGORILERI } from './create-wifi-noktasi.dto';

export class UpdateWifiNoktasiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ad?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adres?: string;

  @IsOptional()
  @IsIn(WIFI_KATEGORILERI)
  kategori?: (typeof WIFI_KATEGORILERI)[number];

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;
}
