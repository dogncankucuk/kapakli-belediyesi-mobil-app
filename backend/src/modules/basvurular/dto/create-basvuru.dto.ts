import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import { IsValidTcKimlikNo } from '../../users/validators/tc-kimlik-no.validator';

export class EkBilgiDegeriDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  etiket: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  deger: string;
}

export class BasvuruBelgeGirisiDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  etiket: string;

  @IsString()
  @IsNotEmpty()
  base64: string;

  @IsIn(['image/jpeg', 'image/png', 'application/pdf'])
  mimeType: string;
}

export class CreateBasvuruDto {
  @IsString()
  @IsNotEmpty()
  basvuruTuruId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  adSoyad: string;

  @IsString()
  @IsValidTcKimlikNo()
  kimlikNo: string;

  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dogumTarihi: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  adres: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => EkBilgiDegeriDto)
  ekBilgiler?: EkBilgiDegeriDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => BasvuruBelgeGirisiDto)
  belgeler?: BasvuruBelgeGirisiDto[];
}
