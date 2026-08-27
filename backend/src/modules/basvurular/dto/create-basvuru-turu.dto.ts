import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EkBilgiAlaniDto {
  @IsString()
  @IsNotEmpty()
  etiket: string;

  @IsBoolean()
  zorunlu: boolean;
}

export class GerekliBelgeDto {
  @IsString()
  @IsNotEmpty()
  etiket: string;

  @IsOptional()
  @IsString()
  aciklama?: string;

  @IsBoolean()
  zorunlu: boolean;
}

export class CreateBasvuruTuruDto {
  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsOptional()
  @IsString()
  aciklama?: string;

  @IsBoolean()
  aktif: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EkBilgiAlaniDto)
  ekBilgiAlanlari?: EkBilgiAlaniDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GerekliBelgeDto)
  gerekliBelgeler?: GerekliBelgeDto[];
}
