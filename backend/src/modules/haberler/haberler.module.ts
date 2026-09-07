import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { Haber, HaberSchema } from './schemas/haber.schema';
import { AdminHaberlerController } from './admin-haberler.controller';
import { AdminHaberlerService } from './admin-haberler.service';
import { HaberlerController } from './haberler.controller';
import { HaberlerService } from './haberler.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Haber.name, schema: HaberSchema }]),
    NotificationsModule,
  ],
  controllers: [HaberlerController, AdminHaberlerController],
  providers: [HaberlerService, AdminHaberlerService],
  exports: [MongooseModule],
})
export class HaberlerModule {}
