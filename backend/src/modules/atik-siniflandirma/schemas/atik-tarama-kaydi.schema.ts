import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AtikTaramaKaydiDocument = HydratedDocument<AtikTaramaKaydi>;

// Her basarili AI taramasinda bir kayit - Atik Rehberi'ndeki "bu hafta
// topluluk ne kadar taradi" tahmini istatistigi icin (kisiye ozel degil,
// sadece gercek kullanim sayisina dayanan dogru bir toplam - bkz.
// AtikSiniflandirmaService.getIstatistik).
@Schema({ timestamps: true, collection: 'atik_tarama_kayitlari' })
export class AtikTaramaKaydi {
  @Prop({ required: true })
  kategori: string;
}

export const AtikTaramaKaydiSchema =
  SchemaFactory.createForClass(AtikTaramaKaydi);
