import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUlasimSecenegiDto {
  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsString()
  @IsNotEmpty()
  aciklama: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}
