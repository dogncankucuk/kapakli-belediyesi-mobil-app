import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateVefatIlaniDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  adSoyad?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  yas?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  not?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  mekan?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  namazVakti?: string;

  @IsOptional()
  @IsDateString()
  tarih?: string;
}
