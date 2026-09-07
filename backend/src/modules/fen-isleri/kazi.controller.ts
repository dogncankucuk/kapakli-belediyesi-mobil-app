import { Controller, Get } from '@nestjs/common';

import { KaziService, PublicKazi } from './kazi.service';

@Controller('kazi-calismalari')
export class KaziController {
  constructor(private readonly kaziService: KaziService) {}

  @Get()
  findUpcoming(): Promise<PublicKazi[]> {
    return this.kaziService.findUpcoming();
  }
}
