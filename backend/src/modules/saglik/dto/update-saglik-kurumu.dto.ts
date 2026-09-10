import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { SAGLIK_TURLERI } from './create-saglik-kurumu.dto';

export class UpdateSaglikKurumuDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ad?: string;

  @IsOptional()
  @IsIn(SAGLIK_TURLERI)
  tur?: (typeof SAGLIK_TURLERI)[number];

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
