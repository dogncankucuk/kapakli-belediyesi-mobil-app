import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';

import { MenuKalemiDto } from './menu-kalemi.dto';

export class UpdateGununMenusuDto {
  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuKalemiDto)
  kalemler?: MenuKalemiDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiyat?: number;
}
