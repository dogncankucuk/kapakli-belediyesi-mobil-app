import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const TALEP_DURUMLARI = ['beklemede', 'islemde', 'tamamlandi'] as const;

export type TalepDurumu = (typeof TALEP_DURUMLARI)[number];

export class UpdateRequestDto {
  @IsOptional()
  @IsIn(TALEP_DURUMLARI)
  durum?: TalepDurumu;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminNotu?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  kullaniciNotu?: string;
}
