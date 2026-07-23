import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { RequestsModule } from './modules/requests/requests.module';
import { PharmaciesModule } from './modules/pharmacies/pharmacies.module';
import { MeclisKararlariModule } from './modules/meclis-kararlari/meclis-kararlari.module';
import { VefatEdenlerModule } from './modules/vefat-edenler/vefat-edenler.module';
import { WifiNoktalariModule } from './modules/wifi-noktalari/wifi-noktalari.module';
import { SehirKameralariModule } from './modules/sehir-kameralari/sehir-kameralari.module';
import { UlasimHatlariModule } from './modules/ulasim-hatlari/ulasim-hatlari.module';
import { SuHizmetleriModule } from './modules/su-hizmetleri/su-hizmetleri.module';
import { KentLokantasiModule } from './modules/kent-lokantasi/kent-lokantasi.module';
import { HavaKalitesiModule } from './modules/hava-kalitesi/hava-kalitesi.module';
import { HavaDurumuModule } from './modules/hava-durumu/hava-durumu.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { CamilerModule } from './modules/camiler/camiler.module';
import { OnemliKurumlarModule } from './modules/onemli-kurumlar/onemli-kurumlar.module';
import { AdminModule } from './admin/admin.module';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'admin-panel', 'dist'),
      serveRoot: '/admin',
      exclude: ['/admin-api*'],
    }),
    AnnouncementsModule,
    AppointmentsModule,
    RequestsModule,
    PharmaciesModule,
    MeclisKararlariModule,
    VefatEdenlerModule,
    WifiNoktalariModule,
    SehirKameralariModule,
    UlasimHatlariModule,
    SuHizmetleriModule,
    KentLokantasiModule,
    HavaKalitesiModule,
    HavaDurumuModule,
    AdminUsersModule,
    CamilerModule,
    OnemliKurumlarModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
