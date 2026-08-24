import { Controller, Get } from '@nestjs/common';

import {
  BasvuruHizmetleriService,
  PublicBasvuruHizmeti,
} from './basvuru-hizmetleri.service';

@Controller('basvuru-hizmetleri')
export class BasvuruHizmetleriController {
  constructor(
    private readonly basvuruHizmetleriService: BasvuruHizmetleriService,
  ) {}

  @Get()
  findAll(): Promise<PublicBasvuruHizmeti[]> {
    return this.basvuruHizmetleriService.findAll();
  }
}
