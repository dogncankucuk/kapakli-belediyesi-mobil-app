import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMeclisKarariDto {
  @IsString()
  @IsNotEmpty()
  kararNo: string;

  @IsString()
  @IsNotEmpty()
  kategori: string;

  @IsDateString()
  tarih: string;

  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dosyaUrlleri?: string[];

  @IsOptional()
  @IsString()
  youtubeUrl?: string;
}
