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
}

export const AtikNoktasiSchema = SchemaFactory.createForClass(AtikNoktasi);
