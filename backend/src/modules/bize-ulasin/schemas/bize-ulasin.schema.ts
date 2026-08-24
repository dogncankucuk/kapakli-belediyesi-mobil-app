import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BizeUlasinDocument = HydratedDocument<BizeUlasin>;

// Tek kayitlik (singleton) icerik - Bize Ulasin ekranindaki iletisim
// bilgilerini tutar.
@Schema({ timestamps: true, collection: 'bizeUlasin' })
export class BizeUlasin {
  @Prop({ required: true, default: '' })
  telefon: string;

  @Prop({ required: true, default: '' })
  whatsapp: string;

  @Prop({ required: true, default: '' })
  eposta: string;

  @Prop({ required: true, default: '' })
  adres: string;

  @Prop({ required: true, default: 0 })
  lat: number;

  @Prop({ required: true, default: 0 })
  lng: number;

  @Prop()
  updatedBy?: string;
}

export const BizeUlasinSchema = SchemaFactory.createForClass(BizeUlasin);
