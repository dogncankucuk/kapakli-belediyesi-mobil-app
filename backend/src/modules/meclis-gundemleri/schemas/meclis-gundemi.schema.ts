import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MeclisGundemiDocument = HydratedDocument<MeclisGundemi>;

@Schema({ timestamps: true, collection: 'meclisGundemleri' })
export class MeclisGundemi {
  @Prop({ required: true })
  baslik: string;

  @Prop({ required: true })
  tarih: Date;

  @Prop()
  dosyaUrl?: string;

  @Prop()
  updatedBy?: string;
}

export const MeclisGundemiSchema = SchemaFactory.createForClass(MeclisGundemi);
