import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { OptionalJwtAuthGuard } from '../users/optional-jwt-auth.guard';
import { UsersModule } from '../users/users.module';
import {
  RequestCounter,
  RequestCounterSchema,
} from './schemas/request-counter.schema';
import { RequestItem, RequestSchema } from './schemas/request.schema';
import { AdminRequestsController } from './admin-requests.controller';
import { AdminRequestsService } from './admin-requests.service';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestItem.name, schema: RequestSchema },
      { name: RequestCounter.name, schema: RequestCounterSchema },
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
  controllers: [RequestsController, AdminRequestsController],
  providers: [RequestsService, AdminRequestsService, OptionalJwtAuthGuard],
  exports: [MongooseModule],
})
export class RequestsModule {}
