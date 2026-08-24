import { IsOptional, IsString } from 'class-validator';

export class UpdateSuHizmetleriAyarlariDto {
  @IsOptional()
  @IsString()
  kesintilerKaynakUrl?: string;

  @IsOptional()
  @IsString()
  kesintilerGoruntulemeUrl?: string;
}
