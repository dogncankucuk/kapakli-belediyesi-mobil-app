import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AtikNoktasiDocument = HydratedDocument<AtikNoktasi>;

@Schema({ timestamps: true, collection: 'atikNoktalari' })
export class AtikNoktasi {
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

  // CBS kaynagindaki poi_id degeri - bu koleksiyonda "ad" tekil olmadigi icin
  // (ör. birden fazla "ATIK GETİRME ARACI" adli nokta) senkronizasyonda
  // dogru eslestirme icin kullaniliyor.
  @Prop()
  cbsPoiId?: string;
}

export const AtikNoktasiSchema = SchemaFactory.createForClass(AtikNoktasi);
