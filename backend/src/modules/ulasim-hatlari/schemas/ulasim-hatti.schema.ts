import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KalkisYonu = 'gidis' | 'donus';

// Hatlarin kalkis saatleri duzenli araliklarla olmadigi icin (bkz. Tekulas
// referans sayfasi), tek bir serbest metin yerine her biri yon etiketli
// (gidis/donus) ayri saat kayitlari - admin panelinde eklenip/silinebilen ve
// yonu tiklanarak degistirilebilen kucuk "chip"ler olarak girilir.
@Schema({ _id: false })
export class KalkisSaati {
  @Prop({ required: true })
  saat: string;

  @Prop({ required: true })
  yon: KalkisYonu;
}

export const KalkisSaatiSchema = SchemaFactory.createForClass(KalkisSaati);

export type UlasimHattiDocument = HydratedDocument<UlasimHatti>;

// "canli" ve "hatKodu" gercek canli takip icin kullanilir: hatKodu doluysa, Tekulas
// A.S.'nin (T.C. Tekirdag Buyuksehir Belediyesi'nin ulasim sirketi) kendi
// canli konum API'sini sorgulayabiliyoruz (bkz. tekulas-canli-takip.service.ts).
// Ileride gercek bir canli harita (otobuslerin haritadaki anlik konumu)
// eklenecek - o zaman bu modelde degisiklik gerekmez, sadece mobil/admin
// tarafinda hatKodu + canli alanlarini kullanan yeni bir harita bileseni
// eklenir.
@Schema({ timestamps: true, collection: 'ulasimHatlari' })
export class UlasimHatti {
  @Prop({ required: true })
  hatAdi: string;

  // Hattin herkese acik numarasi/kodu (ör. "14", "T1") - Tekulas'in dahili
  // canli takip kodu olan hatKodu'ndan farklidir.
  @Prop()
  hatNumarasi?: string;

  @Prop({ required: true })
  guzergah: string;

  @Prop({ required: true, default: false })
  canli: boolean;

  // Tekulas'in dahili hat kodu (data-line-code) - GET /ulasim-hatlari/:id/canli
  // bu kodu kullanarak Tekulas'in kendi API'sini sorgular. Bos ise o hat icin
  // canli takip yapilamaz.
  @Prop()
  hatKodu?: string;

  // Serbest metin - "15 TL" gibi.
  @Prop()
  fiyatTam?: string;

  @Prop()
  fiyatIndirimli?: string;

  @Prop({ type: [KalkisSaatiSchema], default: [] })
  kalkisSaatleri: KalkisSaati[];

  @Prop()
  updatedBy?: string;
}

export const UlasimHattiSchema = SchemaFactory.createForClass(UlasimHatti);
