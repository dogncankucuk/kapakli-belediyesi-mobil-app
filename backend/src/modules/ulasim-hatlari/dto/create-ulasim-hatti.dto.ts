import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import type { KalkisGunu, KalkisYonu } from '../schemas/ulasim-hatti.schema';

export class KalkisSaatiDto {
  @IsString()
  @IsNotEmpty()
  saat: string;

  @IsIn(['gidis', 'donus'])
  yon: KalkisYonu;

  @IsOptional()
  @IsIn(['hergun', 'haftaici', 'haftasonu'])
  gun?: KalkisGunu;
}

export class CreateUlasimHattiDto {
  @IsString()
  @IsNotEmpty()
  hatAdi: string;

  @IsOptional()
  @IsString()
  hatNumarasi?: string;

  @IsString()
  @IsNotEmpty()
  guzergah: string;

  @IsBoolean()
  canli: boolean;

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
