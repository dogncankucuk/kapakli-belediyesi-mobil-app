import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { OptionalJwtAuthGuard } from '../users/optional-jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { AdminBasvuruTurleriController } from './admin-basvuru-turleri.controller';
import { AdminBasvuruTurleriService } from './admin-basvuru-turleri.service';
import { AdminBasvurularController } from './admin-basvurular.controller';
import { AdminBasvurularService } from './admin-basvurular.service';
import { BasvuruTurleriController } from './basvuru-turleri.controller';
import { BasvuruTurleriService } from './basvuru-turleri.service';
import { BasvurularController } from './basvurular.controller';
import { BasvurularService } from './basvurular.service';
import { BasvuruTuru, BasvuruTuruSchema } from './schemas/basvuru-turu.schema';
import { Basvuru, BasvuruSchema } from './schemas/basvuru.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BasvuruTuru.name, schema: BasvuruTuruSchema },
      { name: Basvuru.name, schema: BasvuruSchema },
    ]),
    NotificationsModule,
    // UsersModule zaten User modelini export ediyor - OptionalJwtAuthGuard'in
    // ihtiyac duydugu JwtService burada da users.module.ts ile ayni sekilde
    // saglaniyor (bkz. notifications.module.ts'teki ayni desen).
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    BasvuruTurleriController,
    AdminBasvuruTurleriController,
    BasvurularController,
    AdminBasvurularController,
  ],
  providers: [
    BasvuruTurleriService,
    AdminBasvuruTurleriService,
    BasvurularService,
    AdminBasvurularService,
    OptionalJwtAuthGuard,
  ],
  exports: [MongooseModule],
})
export class BasvurularModule {}
