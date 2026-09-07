import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateKaziDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mahalle?: string;

  @IsOptional()
  @IsDateString()
  baslangicTarihi?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sureGun?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  saat?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  aciklama?: string;
}
