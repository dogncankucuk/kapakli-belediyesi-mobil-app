import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SaglikKurumuDocument = HydratedDocument<SaglikKurumu>;

@Schema({ timestamps: true, collection: 'saglik_kurumlari' })
export class SaglikKurumu {
  @Prop({ required: true })
  ad: string;

  @Prop({ required: true })
  tur: string;

  @Prop()
  adres?: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop()
  updatedBy?: string;

  // CBS kaynagindaki poi_id - senkronizasyonda dogru eslestirme icin
  // kullaniliyor (ad tek basina guvenilir bir anahtar degil).
  @Prop()
  cbsPoiId?: string;
}

export const SaglikKurumuSchema = SchemaFactory.createForClass(SaglikKurumu);
