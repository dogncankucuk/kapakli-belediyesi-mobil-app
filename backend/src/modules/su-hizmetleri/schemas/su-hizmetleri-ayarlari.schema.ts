import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SuHizmetleriAyarlariDocument = HydratedDocument<SuHizmetleriAyarlari>;

// Tek kayitlik (singleton) icerik - Planli Kesintiler verisinin disaridan
// hangi linkten cekilecegini ve vatandasa "tam sayfayi goruntule" icin
// gosterilecek linki tutar.
@Schema({ timestamps: true, collection: 'suHizmetleriAyarlari' })
export class SuHizmetleriAyarlari {
  @Prop({ default: '' })
  kesintilerKaynakUrl?: string;

  @Prop({ default: '' })
  kesintilerGoruntulemeUrl?: string;

  @Prop()
  updatedBy?: string;
}

export const SuHizmetleriAyarlariSchema = SchemaFactory.createForClass(
  SuHizmetleriAyarlari,
);
