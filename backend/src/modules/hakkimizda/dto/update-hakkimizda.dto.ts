import { IsOptional, IsString } from 'class-validator';

export class UpdateHakkimizdaDto {
  @IsOptional()
  @IsString()
  baskanOzetMetni?: string;

  @IsOptional()
  @IsString()
  tarihcePhotoUrl?: string;

  @IsOptional()
  @IsString()
  tarihce?: string;

  @IsOptional()
  @IsString()
  kurulusYili?: string;

  @IsOptional()
  @IsString()
  buyuksehirYili?: string;

  @IsOptional()
  @IsString()
  nufus?: string;
}
