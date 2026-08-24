import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HakkimizdaDocument = HydratedDocument<Hakkimizda>;

// Tek kayitlik (singleton) icerik - Hakkimizda ekranindaki baskan ozeti +
// Kapakli tarihcesi + istatistik rozetlerini bir arada tutar.
@Schema({ timestamps: true, collection: 'hakkimizda' })
export class Hakkimizda {
  @Prop({ required: true, default: '' })
  baskanOzetMetni: string;

  @Prop()
  tarihcePhotoUrl?: string;

  @Prop({ type: [String], default: [] })
  tarihceParagraflari: string[];

  @Prop({ required: true, default: '' })
  kurulusYili: string;

  @Prop({ required: true, default: '' })
  buyuksehirYili: string;

  @Prop({ required: true, default: '' })
  nufus: string;

  @Prop()
  updatedBy?: string;
}

export const HakkimizdaSchema = SchemaFactory.createForClass(Hakkimizda);
