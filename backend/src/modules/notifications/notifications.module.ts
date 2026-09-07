import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtAuthGuard } from '../users/jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import { AdminNotificationsController } from './admin-notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { PushTokensController } from './push-tokens.controller';
import {
  Notification,
  NotificationSchema,
} from './schemas/notification.schema';
import { PushToken, PushTokenSchema } from './schemas/push-token.schema';

@Module({
  imports: [
    // UsersModule zaten User modelini MongooseModule.forFeature ile
    // kaydedip export ediyor - burada tekrar kaydetmek Mongoose'un ayni
    // modeli iki kez derlemeye calismasina yol acardi.
    UsersModule,
    MongooseModule.forFeature([
      { name: PushToken.name, schema: PushTokenSchema },
      { name: Notification.name, schema: NotificationSchema },
    ]),
    // JwtAuthGuard (vatandas girisi) UsersModule'de export edilmiyor - guard'in
    // ihtiyac duydugu JwtService burada da users.module.ts ile ayni sekilde
    // saglaniyor.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [PushTokensController, AdminNotificationsController],
  providers: [NotificationsService, PushService, JwtAuthGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
