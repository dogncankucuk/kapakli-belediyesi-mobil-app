import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { KesintiApiAyarlariModule } from '../kesinti-api-ayarlari/kesinti-api-ayarlari.module';
import {
  PlanliKesinti,
  PlanliKesintiSchema,
} from './schemas/planli-kesinti.schema';
import { AdminPlanliKesintilerController } from './admin-planli-kesintiler.controller';
import { AdminPlanliKesintilerService } from './admin-planli-kesintiler.service';
import { PlanliKesintilerService } from './planli-kesintiler.service';
import { SuHizmetleriController } from './su-hizmetleri.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlanliKesinti.name, schema: PlanliKesintiSchema },
    ]),
    NotificationsModule,
    KesintiApiAyarlariModule,
  ],
  controllers: [SuHizmetleriController, AdminPlanliKesintilerController],
  providers: [PlanliKesintilerService, AdminPlanliKesintilerService],
  exports: [MongooseModule],
})
export class SuHizmetleriModule {}
