import {
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
  @IsString()
  resimUrl?: string;

  @IsOptional()
  @IsDateString()
  yayinTarihi?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  kategori?: string;
}
