import { Controller, Get } from '@nestjs/common';

import { BarajlarService, PublicBaraj } from './barajlar.service';
import {
  PlanliKesintilerService,
  PublicPlanliKesinti,
} from './planli-kesintiler.service';

@Controller()
export class SuHizmetleriController {
  constructor(
    private readonly barajlarService: BarajlarService,
    private readonly planliKesintilerService: PlanliKesintilerService,
  ) {}

  @Get('barajlar')
  findBarajlar(): Promise<PublicBaraj[]> {
    return this.barajlarService.findAll();
  }

  @Get('planli-kesintiler')
  findKesintiler(): Promise<PublicPlanliKesinti[]> {
    return this.planliKesintilerService.findUpcoming();
  }
}
