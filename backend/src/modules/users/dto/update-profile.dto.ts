import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  mahalle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adres?: string;

  @IsOptional()
  @IsString()
  profilFotografiBase64?: string;
}
