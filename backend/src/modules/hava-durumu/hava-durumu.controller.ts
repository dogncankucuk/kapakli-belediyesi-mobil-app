import { Controller, Get } from '@nestjs/common';

import { HavaDurumuService, PublicHavaDurumu } from './hava-durumu.service';

@Controller('hava-durumu')
export class HavaDurumuController {
  constructor(private readonly havaDurumuService: HavaDurumuService) {}

  @Get()
  getCurrent(): Promise<PublicHavaDurumu> {
    return this.havaDurumuService.getCurrent();
  }
}
