import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFaturaOdemeKurumuDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ad?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  aciklama?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string;
}
