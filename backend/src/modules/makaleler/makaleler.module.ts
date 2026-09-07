import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { Makale, MakaleSchema } from './schemas/makale.schema';
import { AdminMakalelerController } from './admin-makaleler.controller';
import { AdminMakalelerService } from './admin-makaleler.service';
import { MakalelerController } from './makaleler.controller';
import { MakalelerService } from './makaleler.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Makale.name, schema: MakaleSchema }]),
    NotificationsModule,
  ],
  controllers: [MakalelerController, AdminMakalelerController],
  providers: [MakalelerService, AdminMakalelerService],
  exports: [MongooseModule],
})
export class MakalelerModule {}
