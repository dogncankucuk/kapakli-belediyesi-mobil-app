import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FaturaOdemeKurumuDocument = HydratedDocument<FaturaOdemeKurumu>;

@Schema({ timestamps: true, collection: 'faturaOdemeKurumlari' })
export class FaturaOdemeKurumu {
  @Prop({ required: true })
  ad: string;

  @Prop({ required: true })
  aciklama: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  updatedBy?: string;
}

export const FaturaOdemeKurumuSchema =
  SchemaFactory.createForClass(FaturaOdemeKurumu);
