import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type KesintiApiTuru = 'su' | 'elektrik' | 'ulasim' | 'eczane';

export type KesintiApiAyariDocument = HydratedDocument<KesintiApiAyari>;

// Su/elektrik kesintileri ve ulasim hatlari icin ileride cekilecek dis API
// adreslerini tutar (isim "kesinti" olsa da ulasim hatlari da ayni
// mekanizmayi kullaniyor - kapsam genisledi, koleksiyon adi geriye donuk
// uyumluluk icin degistirilmedi). Bilerek RbacGuard/RequirePermission
// uzerinden degil, ayri bir SuperAdminGuard uzerinden korunuyor - hicbir
// role (isFullAccess=false) bu kaynaga izin verilerek erisim kazanamaz,
// sadece sistemin tek Super Admin rolu gorebilir/degistirebilir.
@Schema({ timestamps: true, collection: 'kesintiApiAyarlari' })
export class KesintiApiAyari {
  @Prop({ required: true, enum: ['su', 'elektrik', 'ulasim'], unique: true })
  tur: KesintiApiTuru;

  @Prop({ default: '' })
  apiUrl: string;

  @Prop()
  updatedBy?: string;
}

export const KesintiApiAyariSchema = SchemaFactory.createForClass(KesintiApiAyari);
