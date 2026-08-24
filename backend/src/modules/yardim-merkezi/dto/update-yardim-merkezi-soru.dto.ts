import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateYardimMerkeziSoruDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  soru?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  cevap?: string;
}
