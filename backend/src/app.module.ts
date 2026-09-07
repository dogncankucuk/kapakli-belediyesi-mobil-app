import { join } from 'path';

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { HaberlerModule } from './modules/haberler/haberler.module';
import { IlanlarModule } from './modules/ilanlar/ilanlar.module';
import { IhalelerModule } from './modules/ihaleler/ihaleler.module';
import { MakalelerModule } from './modules/makaleler/makaleler.module';
import { MeclisGundemleriModule } from './modules/meclis-gundemleri/meclis-gundemleri.module';
import { BaskanModule } from './modules/baskan/baskan.module';
import { HakkimizdaModule } from './modules/hakkimizda/hakkimizda.module';
import { BizeUlasinModule } from './modules/bize-ulasin/bize-ulasin.module';
import { YardimMerkeziModule } from './modules/yardim-merkezi/yardim-merkezi.module';
import { FaturaOdemeModule } from './modules/fatura-odeme/fatura-odeme.module';
import { UlasimHizmetleriModule } from './modules/ulasim-hizmetleri/ulasim-hizmetleri.module';
import { TemaAyarlariModule } from './modules/tema-ayarlari/tema-ayarlari.module';
import { PanelTemasiModule } from './modules/panel-temasi/panel-temasi.module';
import { AtikNoktalariModule } from './modules/atik-noktalari/atik-noktalari.module';
import { AtikRehberiModule } from './modules/atik-rehberi/atik-rehberi.module';
import { AtikSiniflandirmaModule } from './modules/atik-siniflandirma/atik-siniflandirma.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { RequestsModule } from './modules/requests/requests.module';
import { PharmaciesModule } from './modules/pharmacies/pharmacies.module';
import { MeclisKararlariModule } from './modules/meclis-kararlari/meclis-kararlari.module';
import { VefatEdenlerModule } from './modules/vefat-edenler/vefat-edenler.module';
import { WifiNoktalariModule } from './modules/wifi-noktalari/wifi-noktalari.module';
import { UlasimHatlariModule } from './modules/ulasim-hatlari/ulasim-hatlari.module';
import { SuHizmetleriModule } from './modules/su-hizmetleri/su-hizmetleri.module';
import { FenIsleriModule } from './modules/fen-isleri/fen-isleri.module';
import { ElektrikModule } from './modules/elektrik/elektrik.module';
import { AseviModule } from './modules/asevi/asevi.module';
import { HavaKalitesiModule } from './modules/hava-kalitesi/hava-kalitesi.module';
import { HavaDurumuModule } from './modules/hava-durumu/hava-durumu.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { CamilerModule } from './modules/camiler/camiler.module';
import { OnemliKurumlarModule } from './modules/onemli-kurumlar/onemli-kurumlar.module';
import { ParklarModule } from './modules/parklar/parklar.module';
import { TarihiYerlerModule } from './modules/tarihi-yerler/tarihi-yerler.module';
import { UsersModule } from './modules/users/users.module';
import { FormlarModule } from './modules/formlar/formlar.module';
import { BasvuruHizmetleriModule } from './modules/basvuru-hizmetleri/basvuru-hizmetleri.module';
import { BasvurularModule } from './modules/basvurular/basvurular.module';
import { RolesModule } from './modules/roles/roles.module';
import { MedyaModule } from './modules/medya/medya.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { UPLOADS_DIR } from './uploads-dir';

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
    ServeStaticModule.forRoot(
      {
        rootPath: join(__dirname, '..', '..', 'admin-panel', 'dist'),
        serveRoot: '/admin',
        exclude: ['/admin-api*'],
      },
      {
        // Medya kutuphanesine yuklenen dosyalar - herkese acik, kimlik
        // dogrulamasiz statik sunum (icerikte kullanilan resim/dosya
        // linkleri direkt bu yoldan calisir).
        rootPath: UPLOADS_DIR,
        serveRoot: '/uploads',
      },
    ),
    // Genel varsayilan: IP basina dakikada 100 istek. Brute-force/spam riski
    // yuksek olan public endpoint'ler (auth, requests, appointments) kendi
    // route'larinda @Throttle ile daha siki limit tanimliyor.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    ScheduleModule.forRoot(),
    AnnouncementsModule,
    HaberlerModule,
    IlanlarModule,
    IhalelerModule,
    MakalelerModule,
    MeclisGundemleriModule,
    BaskanModule,
    HakkimizdaModule,
    BizeUlasinModule,
    YardimMerkeziModule,
    FaturaOdemeModule,
    UlasimHizmetleriModule,
    TemaAyarlariModule,
    PanelTemasiModule,
    AtikNoktalariModule,
    AtikRehberiModule,
    AtikSiniflandirmaModule,
    AppointmentsModule,
    RequestsModule,
    PharmaciesModule,
    MeclisKararlariModule,
    VefatEdenlerModule,
    WifiNoktalariModule,
    UlasimHatlariModule,
    SuHizmetleriModule,
    FenIsleriModule,
    ElektrikModule,
    AseviModule,
    HavaKalitesiModule,
    HavaDurumuModule,
    AdminUsersModule,
    CamilerModule,
    OnemliKurumlarModule,
    ParklarModule,
    TarihiYerlerModule,
    UsersModule,
    FormlarModule,
    BasvuruHizmetleriModule,
    BasvurularModule,
    RolesModule,
    MedyaModule,
    NotificationsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
