import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { BASVURU_DURUMLARI } from '../schemas/basvuru.schema';
import type { BasvuruDurumu } from '../schemas/basvuru.schema';

export class UpdateBasvuruDto {
  @IsIn(BASVURU_DURUMLARI)
  durum: BasvuruDurumu;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  redSebebi?: string;
}
