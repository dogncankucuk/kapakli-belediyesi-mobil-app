import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Talep numarasi (kategoriKodu-siraNo) uretmek icin kategori basina atomik
// sayac tutar - bkz. RequestsService.create().
export type RequestCounterDocument = HydratedDocument<RequestCounter>;

@Schema({ collection: 'request_counters' })
export class RequestCounter {
  @Prop({ required: true, unique: true })
  kategori: string;

  @Prop({ required: true, default: 0 })
  seq: number;
}

export const RequestCounterSchema =
  SchemaFactory.createForClass(RequestCounter);
