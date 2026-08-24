import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UlasimSecenegiDocument = HydratedDocument<UlasimSecenegi>;

@Schema({ timestamps: true, collection: 'ulasimSecenekleri' })
export class UlasimSecenegi {
  @Prop({ required: true })
  baslik: string;

  @Prop({ required: true })
  aciklama: string;

  @Prop({ required: true })
  url: string;

  @Prop()
  updatedBy?: string;
}

export const UlasimSecenegiSchema =
  SchemaFactory.createForClass(UlasimSecenegi);
