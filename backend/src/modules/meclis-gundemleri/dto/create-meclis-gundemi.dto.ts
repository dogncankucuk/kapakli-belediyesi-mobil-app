import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMeclisGundemiDto {
  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsDateString()
  tarih: string;

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
