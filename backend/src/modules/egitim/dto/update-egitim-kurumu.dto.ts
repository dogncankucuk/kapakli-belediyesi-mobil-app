import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { EGITIM_TURLERI } from './create-egitim-kurumu.dto';

export class UpdateEgitimKurumuDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ad?: string;

  @IsOptional()
  @IsIn(EGITIM_TURLERI)
  tur?: (typeof EGITIM_TURLERI)[number];

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
