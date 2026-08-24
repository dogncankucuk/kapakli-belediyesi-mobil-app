import { Controller, Get } from '@nestjs/common';

import { BizeUlasinService, PublicBizeUlasin } from './bize-ulasin.service';

@Controller('bize-ulasin')
export class BizeUlasinController {
  constructor(private readonly bizeUlasinService: BizeUlasinService) {}

  @Get()
  get(): Promise<PublicBizeUlasin> {
    return this.bizeUlasinService.get();
  }
}
