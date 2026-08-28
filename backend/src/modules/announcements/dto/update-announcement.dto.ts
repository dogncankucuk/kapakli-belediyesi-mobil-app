import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baslik?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  icerik?: string;

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

  @IsOptional()
  @IsDateString()
  yayinTarihi?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  kategori?: string;
}
