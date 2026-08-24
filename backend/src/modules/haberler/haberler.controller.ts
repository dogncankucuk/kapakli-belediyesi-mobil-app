import { Controller, Get } from '@nestjs/common';

import { HaberlerService, PublicHaber } from './haberler.service';

@Controller('haberler')
export class HaberlerController {
  constructor(private readonly haberlerService: HaberlerService) {}

  @Get()
  findAll(): Promise<PublicHaber[]> {
    return this.haberlerService.findAll();
  }
}
