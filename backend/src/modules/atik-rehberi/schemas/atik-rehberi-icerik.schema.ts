import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AtikRehberiIcerikDocument = HydratedDocument<AtikRehberiIcerik>;

// Mobildeki Atik Rehberi ekraninda sabit 9 atik turu (bkz. ATIK_TURLERI)
// icin admin panelinden girilen rehber metni. Kategori listesi sabit
// oldugundan bu koleksiyonda create/delete yok - sadece "tur" basina tek
// kayit upsert edilir (bkz. admin-atik-rehberi.service.ts).
@Schema({ timestamps: true, collection: 'atikRehberiIcerikleri' })
export class AtikRehberiIcerik {
  @Prop({ required: true, unique: true })
  tur: string;

  @Prop({ default: '' })
  aciklama: string;

  @Prop()
  updatedBy?: string;
}

export const AtikRehberiIcerikSchema =
  SchemaFactory.createForClass(AtikRehberiIcerik);
