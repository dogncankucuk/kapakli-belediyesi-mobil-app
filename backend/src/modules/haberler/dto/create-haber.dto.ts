import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHaberDto {
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
}
