import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Baraj, BarajSchema } from './schemas/baraj.schema';
import {
  PlanliKesinti,
  PlanliKesintiSchema,
} from './schemas/planli-kesinti.schema';
import {
  SuHizmetleriAyarlari,
  SuHizmetleriAyarlariSchema,
} from './schemas/su-hizmetleri-ayarlari.schema';
import { AdminBarajlarController } from './admin-barajlar.controller';
import { AdminBarajlarService } from './admin-barajlar.service';
import { AdminPlanliKesintilerController } from './admin-planli-kesintiler.controller';
import { AdminPlanliKesintilerService } from './admin-planli-kesintiler.service';
import { AdminSuHizmetleriAyarlariController } from './admin-su-hizmetleri-ayarlari.controller';
import { AdminSuHizmetleriAyarlariService } from './admin-su-hizmetleri-ayarlari.service';
import { BarajlarService } from './barajlar.service';
import { PlanliKesintilerService } from './planli-kesintiler.service';
import { SuHizmetleriAyarlariService } from './su-hizmetleri-ayarlari.service';
import { SuHizmetleriController } from './su-hizmetleri.controller';
import { SuHizmetleriKaynakService } from './su-hizmetleri-kaynak.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Baraj.name, schema: BarajSchema },
      { name: PlanliKesinti.name, schema: PlanliKesintiSchema },
      { name: SuHizmetleriAyarlari.name, schema: SuHizmetleriAyarlariSchema },
    ]),
  ],
  controllers: [
    SuHizmetleriController,
    AdminBarajlarController,
    AdminPlanliKesintilerController,
    AdminSuHizmetleriAyarlariController,
  ],
  providers: [
    BarajlarService,
    PlanliKesintilerService,
    AdminBarajlarService,
    AdminPlanliKesintilerService,
    SuHizmetleriAyarlariService,
    AdminSuHizmetleriAyarlariService,
    SuHizmetleriKaynakService,
  ],
  exports: [MongooseModule],
})
export class SuHizmetleriModule {}
