import { IsIn, IsString } from 'class-validator';

import { ATIK_TURLERI } from '../atik-turleri.const';
import type { AtikTuru } from '../atik-turleri.const';

export class UpdateAtikRehberiIcerikDto {
  @IsIn(ATIK_TURLERI)
  tur: AtikTuru;

  @IsString()
  aciklama: string;
}
