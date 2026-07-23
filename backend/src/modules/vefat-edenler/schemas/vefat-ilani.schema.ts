import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VefatIlaniDocument = HydratedDocument<VefatIlani>;

@Schema({ timestamps: true, collection: 'vefatIlanlari' })
export class VefatIlani {
  @Prop({ required: true })
  adSoyad: string;

  @Prop({ required: true })
  yas: number;

  @Prop({ required: true })
  not: string;

  @Prop({ required: true })
  mekan: string;

  @Prop({ required: true })
  namazVakti: string;

  @Prop({ required: true })
  tarih: Date;

  @Prop()
  updatedBy?: string;
}

export const VefatIlaniSchema = SchemaFactory.createForClass(VefatIlani);
