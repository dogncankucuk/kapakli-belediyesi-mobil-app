import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsString()
  @IsNotEmpty()
  icerik: string;

  @IsOptional()
  @IsString()
  resimUrl?: string;

  @IsDateString()
  yayinTarihi: string;

  @IsString()
  @IsNotEmpty()
  kategori: string;
}
