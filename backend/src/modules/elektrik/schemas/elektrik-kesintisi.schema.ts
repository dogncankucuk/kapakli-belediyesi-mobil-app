import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ElektrikKesintisiDocument = HydratedDocument<ElektrikKesintisi>;

@Schema({ timestamps: true, collection: 'elektrikKesintileri' })
export class ElektrikKesintisi {
  @Prop({ required: true, trim: true })
  mahalle: string;

  @Prop({ required: true })
  tarih: Date;

  @Prop({ required: true })
  aciklama: string;

  @Prop()
  updatedBy?: string;
}

export const ElektrikKesintisiSchema = SchemaFactory.createForClass(
  ElektrikKesintisi,
);
