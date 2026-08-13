import { join } from 'path';

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { AtikNoktalariModule } from './modules/atik-noktalari/atik-noktalari.module';
import { AtikSiniflandirmaModule } from './modules/atik-siniflandirma/atik-siniflandirma.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { RequestsModule } from './modules/requests/requests.module';
import { PharmaciesModule } from './modules/pharmacies/pharmacies.module';
import { MeclisKararlariModule } from './modules/meclis-kararlari/meclis-kararlari.module';
import { VefatEdenlerModule } from './modules/vefat-edenler/vefat-edenler.module';
import { WifiNoktalariModule } from './modules/wifi-noktalari/wifi-noktalari.module';
import { UlasimHatlariModule } from './modules/ulasim-hatlari/ulasim-hatlari.module';
import { SuHizmetleriModule } from './modules/su-hizmetleri/su-hizmetleri.module';
import { AseviModule } from './modules/asevi/asevi.module';
import { HavaKalitesiModule } from './modules/hava-kalitesi/hava-kalitesi.module';
import { HavaDurumuModule } from './modules/hava-durumu/hava-durumu.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { CamilerModule } from './modules/camiler/camiler.module';
import { OnemliKurumlarModule } from './modules/onemli-kurumlar/onemli-kurumlar.module';
import { ParklarModule } from './modules/parklar/parklar.module';
import { TarihiYerlerModule } from './modules/tarihi-yerler/tarihi-yerler.module';
import { UsersModule } from './modules/users/users.module';
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
    // Genel varsayilan: IP basina dakikada 100 istek. Brute-force/spam riski
    // yuksek olan public endpoint'ler (auth, requests, appointments) kendi
    // route'larinda @Throttle ile daha siki limit tanimliyor.
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 100 }]),
    AnnouncementsModule,
    AtikNoktalariModule,
    AtikSiniflandirmaModule,
    AppointmentsModule,
    RequestsModule,
    PharmaciesModule,
    MeclisKararlariModule,
    VefatEdenlerModule,
    WifiNoktalariModule,
    UlasimHatlariModule,
    SuHizmetleriModule,
    AseviModule,
    HavaKalitesiModule,
    HavaDurumuModule,
    AdminUsersModule,
    CamilerModule,
    OnemliKurumlarModule,
    ParklarModule,
    TarihiYerlerModule,
    UsersModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
