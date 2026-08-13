import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AseviBasvuruDocument = HydratedDocument<AseviBasvuru>;

export const ASEVI_BASVURU_DURUMLARI = [
  'beklemede',
  'onaylandi',
  'tamamlandi',
] as const;

export type AseviBasvuruDurumu = (typeof ASEVI_BASVURU_DURUMLARI)[number];

// Asevi halka acik bir lokanta degil - basvuran vatandasin adresine belediyenin
// hizmet araci yemek goturuyor (kapakli.bel.tr/hizmetlerimiz/asevi). Bu yuzden
// "menu" degil, adres/telefon iceren bir basvuru/talep kaydi tutuluyor.
@Schema({ timestamps: true, collection: 'aseviBasvurulari' })
export class AseviBasvuru {
  @Prop({ required: true, trim: true })
  adSoyad: string;

  @Prop({ required: true, trim: true })
  telefon: string;

  @Prop({ required: true, trim: true })
  adres: string;

  @Prop({ trim: true })
  not?: string;

  @Prop({ type: String, enum: ASEVI_BASVURU_DURUMLARI, default: 'beklemede' })
  durum: AseviBasvuruDurumu;

  @Prop()
  updatedBy?: string;
}

export const AseviBasvuruSchema = SchemaFactory.createForClass(AseviBasvuru);
