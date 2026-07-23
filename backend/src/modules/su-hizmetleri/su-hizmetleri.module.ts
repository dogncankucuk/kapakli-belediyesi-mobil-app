import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Baraj, BarajSchema } from './schemas/baraj.schema';
import {
  PlanliKesinti,
  PlanliKesintiSchema,
} from './schemas/planli-kesinti.schema';
import { AdminBarajlarController } from './admin-barajlar.controller';
import { AdminBarajlarService } from './admin-barajlar.service';
import { AdminPlanliKesintilerController } from './admin-planli-kesintiler.controller';
import { AdminPlanliKesintilerService } from './admin-planli-kesintiler.service';
import { BarajlarService } from './barajlar.service';
import { PlanliKesintilerService } from './planli-kesintiler.service';
import { SuHizmetleriController } from './su-hizmetleri.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Baraj.name, schema: BarajSchema },
      { name: PlanliKesinti.name, schema: PlanliKesintiSchema },
    ]),
  ],
  controllers: [
    SuHizmetleriController,
    AdminBarajlarController,
    AdminPlanliKesintilerController,
  ],
  providers: [
    BarajlarService,
    PlanliKesintilerService,
    AdminBarajlarService,
    AdminPlanliKesintilerService,
  ],
  exports: [MongooseModule],
})
export class SuHizmetleriModule {}
