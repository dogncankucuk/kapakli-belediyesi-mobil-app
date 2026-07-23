import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OnemliKurumDocument = HydratedDocument<OnemliKurum>;

@Schema({ timestamps: true, collection: 'onemli_kurumlar' })
export class OnemliKurum {
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

export const OnemliKurumSchema = SchemaFactory.createForClass(OnemliKurum);
