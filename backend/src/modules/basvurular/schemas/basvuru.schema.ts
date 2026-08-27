import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BasvuruDocument = HydratedDocument<Basvuru>;

export const BASVURU_DURUMLARI = [
  'beklemede',
  'onaylandi',
  'reddedildi',
] as const;

export type BasvuruDurumu = (typeof BASVURU_DURUMLARI)[number];

@Schema({ _id: false })
export class EkBilgiDegeri {
  @Prop({ required: true, trim: true })
  etiket: string;

  @Prop({ required: true })
  deger: string;
}

export const EkBilgiDegeriSchema = SchemaFactory.createForClass(EkBilgiDegeri);

@Schema({ _id: false })
export class BasvuruBelgesi {
  @Prop({ required: true, trim: true })
  etiket: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  mimeType: string;
}

export const BasvuruBelgesiSchema =
  SchemaFactory.createForClass(BasvuruBelgesi);

@Schema({ timestamps: true, collection: 'basvurular' })
export class Basvuru {
  // BasvuruTuru'ye Mongoose ref/populate degil, duz string id ile referans
  // veriliyor (bu kod tabanindaki diger modullerle ayni desen).
  @Prop({ required: true })
  basvuruTuruId: string;

  // Basvuru anindaki basvuru turu basligi - tur sonradan yeniden
  // adlandirilsa/silinse bile gecmis kaydin bozulmamasi icin anlik goruntu.
  @Prop({ required: true, trim: true })
  basvuruTuruAdi: string;

  @Prop({ required: true, trim: true })
  adSoyad: string;

  @Prop({ required: true, trim: true })
  kimlikNo: string;

  @Prop({ required: true })
  dogumTarihi: string; // ISO date string "YYYY-MM-DD", not a native Date (matches this codebase's existing date-field convention, e.g. vefat-edenler's `tarih: string`)

  @Prop({ required: true, trim: true })
  adres: string;

  @Prop({ type: [EkBilgiDegeriSchema], default: [] })
  ekBilgiler: EkBilgiDegeri[];

  @Prop({ type: [BasvuruBelgesiSchema], default: [] })
  belgeler: BasvuruBelgesi[];

  @Prop({
    type: String,
    enum: BASVURU_DURUMLARI,
    required: true,
    default: 'beklemede',
  })
  durum: BasvuruDurumu;

  @Prop()
  redSebebi?: string;

  @Prop({ type: String, default: null })
  userId?: string | null;

  @Prop()
  updatedBy?: string;
}

export const BasvuruSchema = SchemaFactory.createForClass(Basvuru);
