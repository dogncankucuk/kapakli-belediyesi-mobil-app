import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUlasimHattiDto {
  @IsString()
  @IsNotEmpty()
  hatAdi: string;

  @IsString()
  @IsNotEmpty()
  guzergah: string;

  @IsString()
  @IsNotEmpty()
  durum: string;

  @IsBoolean()
  canli: boolean;

  @IsOptional()
  @IsString()
  hatKodu?: string;
}
