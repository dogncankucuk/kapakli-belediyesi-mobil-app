import {
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { TARIHI_YER_TURLERI } from './create-tarihi-yer.dto';

export class UpdateTarihiYerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ad?: string;

  @IsOptional()
  @IsIn(TARIHI_YER_TURLERI)
  tur?: (typeof TARIHI_YER_TURLERI)[number];

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
