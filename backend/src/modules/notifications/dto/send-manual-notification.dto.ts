import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  BildirimKategorisi,
  TUM_BILDIRIM_KATEGORILERI,
} from '../notification-categories';

export class SendManualNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  baslik: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  govde: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(TUM_BILDIRIM_KATEGORILERI, { each: true })
  kategoriler: BildirimKategorisi[];
}
