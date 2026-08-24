import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TemaAyarlariDocument = HydratedDocument<TemaAyarlari>;

// Tek kayitlik (singleton) icerik - mobil uygulamanin renk/font temasini
// tutar. NOT: mobil uygulama bu ayarlara henuz baglanmadi (mobile/src/theme
// hala sabit kodlu lightColors/darkColors kullaniyor) - bu sadece admin
// tarafindaki depolama/yonetim katmani.
@Schema({ timestamps: true, collection: 'temaAyarlari' })
export class TemaAyarlari {
  @Prop({ required: true, default: '#1F5C56' })
  primaryColorLight: string;

  @Prop({ required: true, default: '#3E7D74' })
  secondaryColorLight: string;

  @Prop({ required: true, default: '#FBF7F1' })
  backgroundColorLight: string;

  @Prop({ required: true, default: '#7FC9BC' })
  primaryColorDark: string;

  @Prop({ required: true, default: '#6FB3A6' })
  secondaryColorDark: string;

  @Prop({ required: true, default: '#12201D' })
  backgroundColorDark: string;

  @Prop({ required: true, default: 'System' })
  fontFamily: string;

  @Prop()
  updatedBy?: string;
}

export const TemaAyarlariSchema = SchemaFactory.createForClass(TemaAyarlari);
