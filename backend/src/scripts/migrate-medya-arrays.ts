import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';

import { HaberlerModule } from '../modules/haberler/haberler.module';
import { Haber, HaberDocument } from '../modules/haberler/schemas/haber.schema';
import { AnnouncementsModule } from '../modules/announcements/announcements.module';
import {
  Announcement,
  AnnouncementDocument,
} from '../modules/announcements/schemas/announcement.schema';
import { IlanlarModule } from '../modules/ilanlar/ilanlar.module';
import { Ilan, IlanDocument } from '../modules/ilanlar/schemas/ilan.schema';
import { IhalelerModule } from '../modules/ihaleler/ihaleler.module';
import { Ihale, IhaleDocument } from '../modules/ihaleler/schemas/ihale.schema';
import { MakalelerModule } from '../modules/makaleler/makaleler.module';
import { Makale, MakaleDocument } from '../modules/makaleler/schemas/makale.schema';
import { MeclisGundemleriModule } from '../modules/meclis-gundemleri/meclis-gundemleri.module';
import {
  MeclisGundemi,
  MeclisGundemiDocument,
} from '../modules/meclis-gundemleri/schemas/meclis-gundemi.schema';
import { MeclisKararlariModule } from '../modules/meclis-kararlari/meclis-kararlari.module';
import {
  MeclisKarari,
  MeclisKarariDocument,
} from '../modules/meclis-kararlari/schemas/meclis-karari.schema';
import { RolesModule } from '../modules/roles/roles.module';
import { AdminUsersModule } from '../modules/admin-users/admin-users.module';
import '../admin/auth/session.types';

// "Guncel" koleksiyonlarindaki eski tekil resimUrl/dosyaUrl (string) alanlarini
// yeni resimUrlleri/dosyaUrlleri (string[]) alanlarina tasir - tek seferlik
// migrasyon (npm script'e eklenmedi, seed:admin/migrate:roles gibi dogrudan
// ts-node ile calistirilir). Native driver kullanilir (model.collection),
// cunku artik sema sadece yeni alanlari taniyor - eski alani okumak icin
// Mongoose'un semaya gore alan silen davranisini atlamak gerekiyor.
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
    RolesModule,
    HaberlerModule,
    AnnouncementsModule,
    IlanlarModule,
    IhalelerModule,
    MakalelerModule,
    MeclisGundemleriModule,
    MeclisKararlariModule,
  ],
})
class MigrateModule {}

interface EskiBelge {
  _id: unknown;
  resimUrl?: unknown;
  dosyaUrl?: unknown;
}

async function koleksiyonuTasi(
  isim: string,
  model: Model<unknown>,
  alanlar: { resim: boolean; dosya: boolean },
): Promise<number> {
  const belgeler = (await model.collection
    .find({})
    .toArray()) as unknown as EskiBelge[];

  let tasinan = 0;
  for (const belge of belgeler) {
    const set: Record<string, unknown> = {};
    const unset: Record<string, ''> = {};

    if (alanlar.resim) {
      if (typeof belge.resimUrl === 'string' && belge.resimUrl) {
        set.resimUrlleri = [belge.resimUrl];
      }
      unset.resimUrl = '';
    }
    if (alanlar.dosya) {
      if (typeof belge.dosyaUrl === 'string' && belge.dosyaUrl) {
        set.dosyaUrlleri = [belge.dosyaUrl];
      }
      unset.dosyaUrl = '';
    }

    const update: Record<string, unknown> = {};
    if (Object.keys(set).length > 0) update.$set = set;
    if (Object.keys(unset).length > 0) update.$unset = unset;
    if (Object.keys(update).length === 0) continue;

    await model.collection.updateOne({ _id: belge._id as never }, update);
    tasinan++;
  }

  console.log(`${isim}: ${tasinan}/${belgeler.length} belge taşındı.`);
  return tasinan;
}

async function migrateMedyaArrays() {
  const app = await NestFactory.createApplicationContext(MigrateModule);

  try {
    const haberModel = app.get<Model<HaberDocument>>(getModelToken(Haber.name));
    const announcementModel = app.get<Model<AnnouncementDocument>>(
      getModelToken(Announcement.name),
    );
    const ilanModel = app.get<Model<IlanDocument>>(getModelToken(Ilan.name));
    const ihaleModel = app.get<Model<IhaleDocument>>(getModelToken(Ihale.name));
    const makaleModel = app.get<Model<MakaleDocument>>(getModelToken(Makale.name));
    const gundemModel = app.get<Model<MeclisGundemiDocument>>(
      getModelToken(MeclisGundemi.name),
    );
    const karariModel = app.get<Model<MeclisKarariDocument>>(
      getModelToken(MeclisKarari.name),
    );

    console.log('--- Medya alanları dizi formatına taşınıyor ---');
    await koleksiyonuTasi('Haberler', haberModel as unknown as Model<unknown>, {
      resim: true,
      dosya: true,
    });
    await koleksiyonuTasi(
      'Duyurular',
      announcementModel as unknown as Model<unknown>,
      { resim: true, dosya: true },
    );
    await koleksiyonuTasi('İlanlar', ilanModel as unknown as Model<unknown>, {
      resim: true,
      dosya: true,
    });
    await koleksiyonuTasi('İhaleler', ihaleModel as unknown as Model<unknown>, {
      resim: true,
      dosya: true,
    });
    await koleksiyonuTasi('Makaleler', makaleModel as unknown as Model<unknown>, {
      resim: true,
      dosya: true,
    });
    await koleksiyonuTasi(
      'Meclis Gündemleri',
      gundemModel as unknown as Model<unknown>,
      { resim: false, dosya: true },
    );
    await koleksiyonuTasi(
      'Meclis Kararları',
      karariModel as unknown as Model<unknown>,
      { resim: false, dosya: true },
    );

    console.log('--- Tamamlandı ---');
  } finally {
    await app.close();
  }
}

migrateMedyaArrays().catch((error) => {
  console.error('Migrasyon başarısız:', error);
  process.exit(1);
});
