import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlanliKesintiDocument = HydratedDocument<PlanliKesinti>;

@Schema({ timestamps: true, collection: 'planliKesintiler' })
export class PlanliKesinti {
  @Prop({ required: true })
  tarih: Date;

  @Prop({ required: true })
  ilce: string;

  @Prop({ required: true })
  aciklama: string;

  @Prop()
  updatedBy?: string;
}

export const PlanliKesintiSchema = SchemaFactory.createForClass(PlanliKesinti);
