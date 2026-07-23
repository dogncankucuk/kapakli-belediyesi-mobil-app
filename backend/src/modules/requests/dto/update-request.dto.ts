import { IsIn } from 'class-validator';

export const TALEP_DURUMLARI = ['beklemede', 'islemde', 'tamamlandi'] as const;

export type TalepDurumu = (typeof TALEP_DURUMLARI)[number];

export class UpdateRequestDto {
  @IsIn(TALEP_DURUMLARI)
  durum: TalepDurumu;
}
