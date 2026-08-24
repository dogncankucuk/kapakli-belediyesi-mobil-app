import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFaturaOdemeKurumuDto {
  @IsString()
  @IsNotEmpty()
  ad: string;

  @IsString()
  @IsNotEmpty()
  aciklama: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}
