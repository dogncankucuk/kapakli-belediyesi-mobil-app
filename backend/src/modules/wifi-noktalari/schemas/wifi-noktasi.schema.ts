import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WifiNoktasiDocument = HydratedDocument<WifiNoktasi>;

@Schema({ timestamps: true, collection: 'wifiNoktalari' })
export class WifiNoktasi {
  @Prop({ required: true })
  ad: string;

  @Prop({ required: true })
  adres: string;

  // "parklar" | "meydanlar" (design.md Bolum 4 filtre secenekleri)
  @Prop({ required: true })
  kategori: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop()
  updatedBy?: string;
}

export const WifiNoktasiSchema = SchemaFactory.createForClass(WifiNoktasi);
