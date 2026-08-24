import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUlasimSecenegiDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baslik?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  aciklama?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  url?: string;
}
