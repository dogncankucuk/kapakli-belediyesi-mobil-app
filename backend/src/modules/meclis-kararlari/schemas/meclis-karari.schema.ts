import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MeclisKarariDocument = HydratedDocument<MeclisKarari>;

@Schema({ timestamps: true, collection: 'meclisKararlari' })
export class MeclisKarari {
  @Prop({ required: true })
  kararNo: string;

  @Prop({ required: true })
  kategori: string;

  @Prop({ required: true })
  tarih: Date;

  @Prop({ required: true })
  baslik: string;

  @Prop()
  updatedBy?: string;
}

export const MeclisKarariSchema = SchemaFactory.createForClass(MeclisKarari);
