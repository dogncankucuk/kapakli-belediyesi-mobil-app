import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IhaleDocument = HydratedDocument<Ihale>;

@Schema({ timestamps: true, collection: 'ihaleler' })
export class Ihale {
  @Prop({ required: true })
  baslik: string;

  @Prop({ required: true })
  icerik: string;

  @Prop({ type: [String], default: [] })
  resimUrlleri: string[];

  @Prop({ type: [String], default: [] })
  dosyaUrlleri: string[];

  @Prop()
  youtubeUrl?: string;

  @Prop({ required: true })
  yayinTarihi: Date;

  @Prop()
  updatedBy?: string;
}

export const IhaleSchema = SchemaFactory.createForClass(Ihale);
