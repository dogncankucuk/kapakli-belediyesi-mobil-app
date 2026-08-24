import { Controller, Get } from '@nestjs/common';

import { BarajlarService, PublicBaraj } from './barajlar.service';
import {
  PlanliKesintilerService,
  PublicPlanliKesinti,
} from './planli-kesintiler.service';
import {
  PublicSuHizmetleriAyarlari,
  SuHizmetleriAyarlariService,
} from './su-hizmetleri-ayarlari.service';

@Controller()
export class SuHizmetleriController {
  constructor(
    private readonly barajlarService: BarajlarService,
    private readonly planliKesintilerService: PlanliKesintilerService,
    private readonly suHizmetleriAyarlariService: SuHizmetleriAyarlariService,
  ) {}

  @Get('barajlar')
  findBarajlar(): Promise<PublicBaraj[]> {
    return this.barajlarService.findAll();
  }

  @Get('planli-kesintiler')
  findKesintiler(): Promise<PublicPlanliKesinti[]> {
    return this.planliKesintilerService.findUpcoming();
  }

  @Get('su-hizmetleri-ayarlari')
  getAyarlar(): Promise<PublicSuHizmetleriAyarlari> {
    return this.suHizmetleriAyarlariService.get();
  }
}
