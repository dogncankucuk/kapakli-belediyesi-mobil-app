import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateIhaleDto {
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
}
