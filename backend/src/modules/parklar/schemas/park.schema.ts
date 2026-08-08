import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ParkDocument = HydratedDocument<Park>;

@Schema({ timestamps: true, collection: 'parklar' })
export class Park {
  @Prop({ required: true })
  ad: string;

  @Prop({ required: true })
  tur: string;

  @Prop()
  adres?: string;

  @Prop({ required: true })
  lat: number;

  @Prop({ required: true })
  lng: number;

  @Prop()
  updatedBy?: string;
}

export const ParkSchema = SchemaFactory.createForClass(Park);
