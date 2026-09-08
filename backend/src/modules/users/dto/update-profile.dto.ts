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

  // ~2MB'lik bir gorsel base64'e cevrilince boyutu ~%37 buyuyor (2*1024*1024
  // * 1.37 ~= 2.87M karakter) - biraz payla 3M karakter sinirlaniyor.
  @IsOptional()
  @IsString()
  @MaxLength(3_000_000)
  profilFotografiBase64?: string;
}
