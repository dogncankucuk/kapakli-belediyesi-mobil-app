import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PharmacyDocument = HydratedDocument<Pharmacy>;

// architecture.md §3: "pharmacies (nöbetçi eczane) - dış kaynaktan senkronize/cache
// edilen veri". Resmi bir API bulunana kadar admin panelden elle girilir.
@Schema({ timestamps: true, collection: 'pharmacies' })
export class Pharmacy {
  @Prop({ required: true })
  ad: string;

  @Prop({ required: true })
  adres: string;

  @Prop({ required: true })
  telefon: string;

  @Prop({ required: true })
  nobetTarihi: Date;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop()
  updatedBy?: string;
}

export const PharmacySchema = SchemaFactory.createForClass(Pharmacy);
