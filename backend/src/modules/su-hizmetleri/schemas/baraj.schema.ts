import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BarajDocument = HydratedDocument<Baraj>;

@Schema({ timestamps: true, collection: 'barajlar' })
export class Baraj {
  @Prop({ required: true })
  ad: string;

  @Prop({ required: true, min: 0, max: 100 })
  doluluk: number;

  @Prop()
  updatedBy?: string;
}

export const BarajSchema = SchemaFactory.createForClass(Baraj);
