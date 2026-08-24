import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateHakkimizdaDto {
  @IsOptional()
  @IsString()
  baskanOzetMetni?: string;

  @IsOptional()
  @IsString()
  tarihcePhotoUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tarihceParagraflari?: string[];

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
