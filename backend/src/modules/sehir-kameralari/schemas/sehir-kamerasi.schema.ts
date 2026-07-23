import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SehirKamerasiDocument = HydratedDocument<SehirKamerasi>;

@Schema({ timestamps: true, collection: 'sehirKameralari' })
export class SehirKamerasi {
  @Prop({ required: true })
  ad: string;

  @Prop({ required: true, default: true })
  online: boolean;

  @Prop()
  updatedBy?: string;
}

export const SehirKamerasiSchema = SchemaFactory.createForClass(SehirKamerasi);
