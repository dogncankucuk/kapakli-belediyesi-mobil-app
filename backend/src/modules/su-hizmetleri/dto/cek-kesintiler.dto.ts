import { IsOptional, IsString, IsUrl } from 'class-validator';

export class CekKesintilerDto {
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  url?: string;
}
