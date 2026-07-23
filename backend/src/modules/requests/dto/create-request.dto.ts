import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export const TALEP_KATEGORILERI = [
  'ariza-bakim',
  'sikayet',
  'gorus-oneri',
  'diger',
] as const;

export type TalepKategorisi = (typeof TALEP_KATEGORILERI)[number];

export class CreateRequestDto {
  @IsIn(TALEP_KATEGORILERI)
  kategori: TalepKategorisi;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  aciklama: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  adSoyad: string;

  @Matches(/^[0-9+()\-\s]{10,15}$/)
  telefon: string;

  @IsOptional()
  @IsUrl()
  ekDosyaUrl?: string;

  @IsOptional()
  @IsString()
  userId?: string | null;
}
