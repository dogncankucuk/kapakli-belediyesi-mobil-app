import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
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
  ],
  exports: [MongooseModule],
})
export class BasvurularModule {}
