import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UlasimHattiDocument = HydratedDocument<UlasimHatti>;

// "durum" alani admin tarafindan elle guncellenen bir metindir. "canli" ve
// "hatKodu" gercek canli takip icin kullanilir: hatKodu doluysa, Tekulas
// A.S.'nin (T.C. Tekirdag Buyuksehir Belediyesi'nin ulasim sirketi) kendi
// canli konum API'sini sorgulayabiliyoruz (bkz. tekulas-canli-takip.service.ts).
@Schema({ timestamps: true, collection: 'ulasimHatlari' })
export class UlasimHatti {
  @Prop({ required: true })
  hatAdi: string;

  @Prop({ required: true })
  guzergah: string;

  @Prop({ required: true })
  durum: string;

  @Prop({ required: true, default: false })
  canli: boolean;

  // Tekulas'in dahili hat kodu (data-line-code) - GET /ulasim-hatlari/:id/canli
  // bu kodu kullanarak Tekulas'in kendi API'sini sorgular. Bos ise o hat icin
  // canli takip yapilamaz.
  @Prop()
  hatKodu?: string;

  @Prop()
  updatedBy?: string;
}

export const UlasimHattiSchema = SchemaFactory.createForClass(UlasimHatti);
