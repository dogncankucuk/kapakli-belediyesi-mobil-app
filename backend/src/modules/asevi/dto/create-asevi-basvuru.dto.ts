import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateAseviBasvuruDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  adSoyad: string;

  @Matches(/^[0-9+()\-\s]{10,15}$/)
  telefon: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  adres: string;
}
