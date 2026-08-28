import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { KalkisSaatiDto } from './create-ulasim-hatti.dto';

export class UpdateUlasimHattiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  hatAdi?: string;

  @IsOptional()
  @IsString()
  hatNumarasi?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  guzergah?: string;

  @IsOptional()
  @IsBoolean()
  canli?: boolean;

  @IsOptional()
  @IsString()
  hatKodu?: string;

  @IsOptional()
  @IsString()
  fiyatTam?: string;

  @IsOptional()
  @IsString()
  fiyatIndirimli?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => KalkisSaatiDto)
  kalkisSaatleri?: KalkisSaatiDto[];
}
