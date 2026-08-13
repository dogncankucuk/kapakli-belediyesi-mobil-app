import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// 'ariza-bakim'/'sikayet'/'gorus-oneri' eski kategoriler - yeni talepler
// artık aşağıdaki 6 kategoriden birini kullanıyor, ama geçmiş kayıtlar
// (ve admin panelin bunları gösterebilmesi) için enum'dan çıkarılmadı.
export const TALEP_KATEGORILERI = [
  'cevre',
  'hava',
  'gurultu',
  'atik',
  'altyapi',
  'diger',
  'ariza-bakim',
  'sikayet',
  'gorus-oneri',
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
  @IsLatitude()
  lat?: number;

  @IsOptional()
  @IsLongitude()
  lng?: number;

  // Base64 data-URI fotoğraflar (client tarafında küçültülmüş, quality:0.4) -
  // AtikSiniflandirmaScreen'in classifyAtik() için kullandığı aynı desen.
  // En fazla 2 - Mongo doküman boyutunu güvenli tutmak için.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @IsString({ each: true })
  fotograflar?: string[];

  // Sadece çevre/hava/gürültü gibi kategorilerde anlamlı - 0=Hafif..3=Şiddetli.
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(3)
  yogunluk?: number;

  @IsOptional()
  @IsString()
  userId?: string | null;
}
