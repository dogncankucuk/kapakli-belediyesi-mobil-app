import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { Kazi, KaziSchema } from './schemas/kazi.schema';
import { AdminKaziController } from './admin-kazi.controller';
import { AdminKaziService } from './admin-kazi.service';
import { KaziController } from './kazi.controller';
import { KaziService } from './kazi.service';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([{ name: Kazi.name, schema: KaziSchema }]),
  ],
  controllers: [KaziController, AdminKaziController],
  providers: [KaziService, AdminKaziService],
  exports: [MongooseModule],
})
export class FenIsleriModule {}
