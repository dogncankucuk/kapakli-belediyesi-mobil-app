import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { EkBilgiAlaniDto, GerekliBelgeDto } from './create-basvuru-turu.dto';

export class UpdateBasvuruTuruDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baslik?: string;

  @IsOptional()
  @IsString()
  aciklama?: string;

  @IsOptional()
  @IsString()
  gorselUrl?: string;

  @IsOptional()
  @IsBoolean()
  aktif?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EkBilgiAlaniDto)
  ekBilgiAlanlari?: EkBilgiAlaniDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => GerekliBelgeDto)
  gerekliBelgeler?: GerekliBelgeDto[];
}
