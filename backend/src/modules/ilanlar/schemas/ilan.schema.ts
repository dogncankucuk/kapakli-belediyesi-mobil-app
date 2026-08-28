import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type IlanDocument = HydratedDocument<Ilan>;

@Schema({ timestamps: true, collection: 'ilanlar' })
export class Ilan {
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

export const IlanSchema = SchemaFactory.createForClass(Ilan);
