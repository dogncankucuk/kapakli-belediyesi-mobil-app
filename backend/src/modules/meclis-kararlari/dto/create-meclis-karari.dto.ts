import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

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
}
