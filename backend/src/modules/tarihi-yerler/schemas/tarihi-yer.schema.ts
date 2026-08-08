import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TarihiYerDocument = HydratedDocument<TarihiYer>;

@Schema({ timestamps: true, collection: 'tarihiYerler' })
export class TarihiYer {
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

export const TarihiYerSchema = SchemaFactory.createForClass(TarihiYer);
