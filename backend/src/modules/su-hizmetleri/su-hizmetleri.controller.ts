import { Controller, Get } from '@nestjs/common';

import {
  PlanliKesintilerService,
  PublicPlanliKesinti,
} from './planli-kesintiler.service';

@Controller()
export class SuHizmetleriController {
  constructor(private readonly planliKesintilerService: PlanliKesintilerService) {}

  @Get('planli-kesintiler')
  findKesintiler(): Promise<PublicPlanliKesinti[]> {
    return this.planliKesintilerService.findUpcoming();
  }
}
