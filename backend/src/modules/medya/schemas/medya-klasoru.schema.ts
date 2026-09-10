import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MedyaKlasoruDocument = HydratedDocument<MedyaKlasoru>;

@Schema({ timestamps: true, collection: 'medya_klasorleri' })
export class MedyaKlasoru {
  @Prop({ required: true })
  ad: string;

  @Prop()
  updatedBy?: string;
}

export const MedyaKlasoruSchema = SchemaFactory.createForClass(MedyaKlasoru);
