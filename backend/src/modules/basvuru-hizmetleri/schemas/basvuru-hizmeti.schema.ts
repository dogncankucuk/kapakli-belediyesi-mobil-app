import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BasvuruHizmetiDocument = HydratedDocument<BasvuruHizmeti>;

// Hizmetler ekranindaki "basvuru hizmeti" kartlari (orn. Evde Bakim Hizmeti,
// Sosyal Hizmetler Mudurlugu) - tamamen admin panelden elle yonetilir.
@Schema({ timestamps: true, collection: 'basvuruHizmetleri' })
export class BasvuruHizmeti {
  @Prop({ required: true })
  baslik: string;

  @Prop({ required: true })
  ozet: string;

  @Prop({ type: [String], default: [] })
  hizmetler: string[];

  @Prop({ type: [String], default: [] })
  kosullar: string[];

  @Prop()
  calismaSaatleri?: string;

  @Prop()
  sorumluBirim?: string;

  @Prop({ required: true, enum: ['telefon', 'link'] })
  basvuruTuru: string;

  @Prop({ required: true })
  basvuruDegeri: string;

  @Prop()
  updatedBy?: string;
}

export const BasvuruHizmetiSchema =
  SchemaFactory.createForClass(BasvuruHizmeti);
