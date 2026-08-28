import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateIlanDto {
  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsString()
  @IsNotEmpty()
  icerik: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resimUrlleri?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dosyaUrlleri?: string[];

  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @IsDateString()
  yayinTarihi: string;
}
