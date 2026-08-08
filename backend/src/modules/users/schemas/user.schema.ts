import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  ad: string;

  @Prop({ required: true, trim: true })
  soyad: string;

  // Google ile kayit olan kullanicilarda T.C. kimlik no/telefon bilinmez -
  // bu yuzden sparse unique (opsiyonel ama doluysa tekil olmali).
  @Prop({ unique: true, sparse: true })
  tcKimlikNo?: string;

  @Prop({ unique: true, sparse: true })
  telefon?: string;

  @Prop({ unique: true, sparse: true, lowercase: true, trim: true })
  eposta?: string;

  // Google ile kayit olanlarda sifre yok - sadece Google ile giris yapabilirler.
  @Prop()
  passwordHash?: string;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  // Admin tarafindan hesap dondurulmus mu (bkz. admin-api/users). true ise
  // login/loginWithGoogle basarisiz olur, mevcut JWT'ler de tokenVersion
  // artirilarak gecersiz kilinir.
  @Prop({ default: false })
  disabled: boolean;

  // JWT'ye "tv" claim'i olarak gomulur; guard bunu DB'deki degerle
  // karsilastirir. Bir hesap disable edildiginde artirilir, boylece o anda
  // gecerli olan tum token'lar aninda gecersiz olur (sunucu tarafinda
  // tutulan bir blacklist gerekmeden basit bir oturum iptal mekanizmasi).
  @Prop({ default: 0 })
  tokenVersion: number;

  // Sifremi Unuttum akisi: 6 haneli kod bcrypt ile hashlenip burada tutulur,
  // 10 dakika sonra gecersiz olur. passwordResetAttempts, kod tahmin etmeyi
  // (brute-force) sinirlar - 5 yanlis denemeden sonra yeni kod istenmesi gerekir.
  @Prop()
  passwordResetCodeHash?: string;

  @Prop()
  passwordResetExpiresAt?: Date;

  @Prop({ default: 0 })
  passwordResetAttempts: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
