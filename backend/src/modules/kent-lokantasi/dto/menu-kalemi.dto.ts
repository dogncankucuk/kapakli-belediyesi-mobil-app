import { IsNotEmpty, IsString } from 'class-validator';

export class MenuKalemiDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsString()
  @IsNotEmpty()
  aciklama: string;
}
