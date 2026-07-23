import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';

import { MenuKalemiDto } from './menu-kalemi.dto';

export class CreateGununMenusuDto {
  @IsDateString()
  tarih: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MenuKalemiDto)
  kalemler: MenuKalemiDto[];

  @IsNumber()
  @Min(0)
  fiyat: number;
}
