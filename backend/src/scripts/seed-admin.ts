import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { generateSecret, generateURI } from 'otplib';
import type { Model } from 'mongoose';
import * as crypto from 'crypto';

import { AdminUsersModule } from '../modules/admin-users/admin-users.module';
import {
  AdminUser,
  AdminUserDocument,
} from '../modules/admin-users/schemas/admin-user.schema';
import { AdminRole } from '../modules/admin-users/admin-role.enum';

// Sadece bu script için minimal bir modül -- AdminModule (AdminJS bootstrap) dahil edilmez,
// çünkü seed işlemi için gerekli değildir.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AdminUsersModule,
  ],
})
class SeedModule {}

// Bir Süper Admin hesabı oluşturur (npm run seed:admin).
// E-posta/şifre env'den okunur, verilmezse dev için sabit bir e-posta + rastgele şifre üretilir.
async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(SeedModule);

  try {
    const adminUserModel = app.get<Model<AdminUserDocument>>(
      getModelToken(AdminUser.name),
    );

    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@kapakli.local';
    const password =
      process.env.SEED_ADMIN_PASSWORD ??
      crypto.randomBytes(12).toString('base64url');

    const existing = await adminUserModel.findOne({ email }).exec();
    if (existing) {
      console.log(`Admin '${email}' zaten mevcut, yeni kayıt oluşturulmadı.`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const totpSecret = generateSecret();
    const otpauthUri = generateURI({
      issuer: 'Kapaklı Belediyesi Admin',
      label: email,
      secret: totpSecret,
    });

    await adminUserModel.create({
      email,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      totpSecret,
      totpEnabled: true,
    });

    console.log('Süper Admin hesabı oluşturuldu:');
    console.log(`  E-posta:        ${email}`);
    console.log(`  Şifre:          ${password}`);
    console.log(`  TOTP secret:    ${totpSecret}`);
    console.log(`  otpauth URI:    ${otpauthUri}`);
    console.log(
      "TOTP secret'ı bir authenticator app'e (Google Authenticator vb.) manuel olarak ekleyin.",
    );
  } finally {
    await app.close();
  }
}

seedAdmin().catch((error) => {
  console.error('Seed işlemi başarısız:', error);
  process.exit(1);
});
