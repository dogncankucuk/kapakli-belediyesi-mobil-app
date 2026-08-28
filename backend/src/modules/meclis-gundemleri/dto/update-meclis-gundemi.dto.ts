import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateMeclisGundemiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baslik?: string;

  @IsOptional()
  @IsDateString()
  tarih?: string;

  @IsOptional()
  @IsString()
  icerik?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dosyaUrlleri?: string[];

  @IsOptional()
  @IsString()
  youtubeUrl?: string;
}
