import { IsIn } from 'class-validator';

import { ASEVI_BASVURU_DURUMLARI } from '../schemas/asevi-basvuru.schema';
import type { AseviBasvuruDurumu } from '../schemas/asevi-basvuru.schema';

export class UpdateAseviBasvuruDto {
  @IsIn(ASEVI_BASVURU_DURUMLARI)
  durum: AseviBasvuruDurumu;
}
