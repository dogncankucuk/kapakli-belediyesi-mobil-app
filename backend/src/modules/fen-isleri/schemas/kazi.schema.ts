import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KaziDocument = HydratedDocument<Kazi>;

@Schema({ timestamps: true, collection: 'kaziCalismalari' })
export class Kazi {
  @Prop({ required: true, trim: true })
  mahalle: string;

  @Prop({ required: true })
  baslangicTarihi: Date;

  @Prop({ required: true, min: 1 })
  sureGun: number;

  @Prop({ required: true })
  saat: string;

  @Prop({ required: true })
  aciklama: string;

  @Prop()
  updatedBy?: string;
}

export const KaziSchema = SchemaFactory.createForClass(Kazi);
