import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateFormBelgesiDto {
  @IsString()
  @IsNotEmpty()
  baslik: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsIn(['belge', 'form'])
  tur: string;
}
