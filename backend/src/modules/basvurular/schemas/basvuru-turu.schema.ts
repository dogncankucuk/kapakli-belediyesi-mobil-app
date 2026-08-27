import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BasvuruTuruDocument = HydratedDocument<BasvuruTuru>;

@Schema({ _id: false })
export class EkBilgiAlani {
  @Prop({ required: true, trim: true })
  etiket: string;

  @Prop({ required: true })
  zorunlu: boolean;
}

export const EkBilgiAlaniSchema = SchemaFactory.createForClass(EkBilgiAlani);

@Schema({ _id: false })
export class GerekliBelge {
  @Prop({ required: true, trim: true })
  etiket: string;

  @Prop({ trim: true })
  aciklama?: string;

  @Prop({ required: true })
  zorunlu: boolean;
}

export const GerekliBelgeSchema = SchemaFactory.createForClass(GerekliBelge);

@Schema({ timestamps: true, collection: 'basvuruTurleri' })
export class BasvuruTuru {
  @Prop({ required: true, trim: true })
  baslik: string;

  @Prop({ trim: true })
  aciklama?: string;

  @Prop({ required: true, default: true })
  aktif: boolean;

  @Prop({ type: [EkBilgiAlaniSchema], default: [] })
  ekBilgiAlanlari: EkBilgiAlani[];

  @Prop({ type: [GerekliBelgeSchema], default: [] })
  gerekliBelgeler: GerekliBelge[];

  @Prop()
  updatedBy?: string;
}

export const BasvuruTuruSchema = SchemaFactory.createForClass(BasvuruTuru);
