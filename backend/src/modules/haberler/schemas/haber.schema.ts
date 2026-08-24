import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type HaberDocument = HydratedDocument<Haber>;

@Schema({ timestamps: true, collection: 'haberler' })
export class Haber {
  @Prop({ required: true })
  baslik: string;

  @Prop({ required: true })
  icerik: string;

  @Prop()
  resimUrl?: string;

  @Prop({ required: true })
  yayinTarihi: Date;

  @Prop()
  updatedBy?: string;
}

export const HaberSchema = SchemaFactory.createForClass(Haber);
