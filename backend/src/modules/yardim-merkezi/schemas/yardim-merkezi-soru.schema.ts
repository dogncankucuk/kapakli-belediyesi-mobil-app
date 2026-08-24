import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type YardimMerkeziSoruDocument = HydratedDocument<YardimMerkeziSoru>;

@Schema({ timestamps: true, collection: 'yardimMerkeziSorulari' })
export class YardimMerkeziSoru {
  @Prop({ required: true })
  soru: string;

  @Prop({ required: true })
  cevap: string;

  @Prop()
  updatedBy?: string;
}

export const YardimMerkeziSoruSchema =
  SchemaFactory.createForClass(YardimMerkeziSoru);
