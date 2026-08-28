import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MakaleDocument = HydratedDocument<Makale>;

@Schema({ timestamps: true, collection: 'makaleler' })
export class Makale {
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

export const MakaleSchema = SchemaFactory.createForClass(Makale);
