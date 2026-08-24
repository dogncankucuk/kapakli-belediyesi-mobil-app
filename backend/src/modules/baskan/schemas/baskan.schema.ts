import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BaskanDocument = HydratedDocument<Baskan>;

// Tek kayitlik (singleton) icerik - sadece bir doküman tutulur, upsert ile
// guncellenir. "Baskan" tekil olduğu icin liste/CRUD yerine tek bir GET/PATCH
// yeterli.
@Schema({ timestamps: true, collection: 'baskan' })
export class Baskan {
  @Prop({ required: true, default: '' })
  ad: string;

  @Prop()
  photoUrl?: string;

  @Prop({ required: true, default: '' })
  introText: string;

  @Prop({ type: [String], default: [] })
  maddeler: string[];

  @Prop({ required: true, default: '' })
  kapanisText: string;

  @Prop()
  updatedBy?: string;
}

export const BaskanSchema = SchemaFactory.createForClass(Baskan);
