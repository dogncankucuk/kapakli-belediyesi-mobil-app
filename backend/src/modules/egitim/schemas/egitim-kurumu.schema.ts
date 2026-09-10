import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EgitimKurumuDocument = HydratedDocument<EgitimKurumu>;

@Schema({ timestamps: true, collection: 'egitim_kurumlari' })
export class EgitimKurumu {
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

  // CBS kaynagindaki poi_id - bu koleksiyonda ayni okul adi birden fazla
  // ilcede tekrar edebildigi icin (ör. iki ayri "Ertuğrul Gazi Anadolu
  // Lisesi") senkronizasyonda dogru eslestirme icin kullaniliyor.
  @Prop()
  cbsPoiId?: string;
}

export const EgitimKurumuSchema = SchemaFactory.createForClass(EgitimKurumu);
