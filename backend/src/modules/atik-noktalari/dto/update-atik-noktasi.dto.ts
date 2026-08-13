import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ATIK_TURLERI } from './create-atik-noktasi.dto';

export class UpdateAtikNoktasiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ad?: string;

  @IsOptional()
  @IsIn(ATIK_TURLERI)
  tur?: (typeof ATIK_TURLERI)[number];

  @IsOptional()
  @IsString()
  adres?: string;

  @IsOptional()
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;
}
