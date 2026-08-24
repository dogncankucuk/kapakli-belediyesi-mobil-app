import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MedyaDocument = HydratedDocument<Medya>;

@Schema({ timestamps: true, collection: 'medya' })
export class Medya {
  @Prop({ required: true })
  dosyaAdi: string;

  @Prop({ required: true })
  orijinalAd: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  boyut: number;

  @Prop({ required: true })
  url: string;

  @Prop()
  updatedBy?: string;
}

export const MedyaSchema = SchemaFactory.createForClass(Medya);
