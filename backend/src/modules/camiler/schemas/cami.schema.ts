import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CamiDocument = HydratedDocument<Cami>;

@Schema({ timestamps: true, collection: 'camiler' })
export class Cami {
  @Prop({ required: true })
  ad: string;

  @Prop()
  adres?: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop()
  updatedBy?: string;
}

export const CamiSchema = SchemaFactory.createForClass(Cami);
