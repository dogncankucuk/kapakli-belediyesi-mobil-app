import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateElektrikKesintisiDto {
  @IsString()
  @IsNotEmpty()
  mahalle: string;

  @IsDateString()
  tarih: string;

  @IsString()
  @IsNotEmpty()
  aciklama: string;
}
