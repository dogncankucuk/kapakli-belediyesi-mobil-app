import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFormBelgesiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baslik?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string;

  @IsOptional()
  @IsIn(['belge', 'form'])
  tur?: string;
}
