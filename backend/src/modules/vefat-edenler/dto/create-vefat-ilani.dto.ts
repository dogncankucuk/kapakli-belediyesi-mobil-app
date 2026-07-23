import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

export class CreateVefatIlaniDto {
  @IsString()
  @IsNotEmpty()
  adSoyad: string;

  @IsInt()
  @Min(0)
  yas: number;

  @IsString()
  @IsNotEmpty()
  not: string;

  @IsString()
  @IsNotEmpty()
  mekan: string;

  @IsString()
  @IsNotEmpty()
  namazVakti: string;

  @IsDateString()
  tarih: string;
}
