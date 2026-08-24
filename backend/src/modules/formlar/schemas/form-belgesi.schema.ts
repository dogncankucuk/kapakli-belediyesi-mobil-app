import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FormBelgesiDocument = HydratedDocument<FormBelgesi>;

// "belge": dogrudan indirilebilir dosya (pdf/doc/xls...), "form": online
// basvuru sayfasina yonlendiren link. Tamamen admin panelden elle girilir.
@Schema({ timestamps: true, collection: 'formBelgeleri' })
export class FormBelgesi {
  @Prop({ required: true })
  baslik: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true, enum: ['belge', 'form'] })
  tur: string;

  @Prop()
  updatedBy?: string;
}

export const FormBelgesiSchema = SchemaFactory.createForClass(FormBelgesi);
