import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MedyaKlasoruDocument = HydratedDocument<MedyaKlasoru>;

@Schema({ timestamps: true, collection: 'medya_klasorleri' })
export class MedyaKlasoru {
  @Prop({ required: true })
  ad: string;

  // Bos/tanimsiz = herkese acik (kisitlama yok, mevcut/eski klasorlerin
  // davranisi). Doluysa sadece departmanId'si bu listede olan kullanicilar
  // (ya da isFullAccess=true Super Admin) klasoru gorebilir. Rol degil
  // departman bazli - bir kullanicinin rolu (yetki seti) ile hangi birimde
  // calistigi (departman) bilerek ayri kavramlar, bkz. modules/departmanlar.
  @Prop({ type: [String], default: [] })
  gorunurDepartmanlar: string[];

  @Prop()
  updatedBy?: string;
}

export const MedyaKlasoruSchema = SchemaFactory.createForClass(MedyaKlasoru);
