import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMeclisKarariDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  kararNo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  kategori?: string;

  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baslik?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dosyaUrlleri?: string[];

  @IsOptional()
  @IsString()
  youtubeUrl?: string;
}
