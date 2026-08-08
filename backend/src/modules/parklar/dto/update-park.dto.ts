import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { PARK_TURLERI } from './create-park.dto';

export class UpdateParkDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ad?: string;

  @IsOptional()
  @IsIn(PARK_TURLERI)
  tur?: (typeof PARK_TURLERI)[number];

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
