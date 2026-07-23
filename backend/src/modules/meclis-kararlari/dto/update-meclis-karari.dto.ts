import {
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
}
