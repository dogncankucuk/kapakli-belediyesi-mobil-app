import { IsDateString, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateKaziDto {
  @IsString()
  @IsNotEmpty()
  mahalle: string;

  @IsDateString()
  baslangicTarihi: string;

  @IsInt()
  @Min(1)
  sureGun: number;

  @IsString()
  @IsNotEmpty()
  saat: string;

  @IsString()
  @IsNotEmpty()
  aciklama: string;
}
