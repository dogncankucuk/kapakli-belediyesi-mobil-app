import { Controller, Get } from '@nestjs/common';

import {
  BasvuruTurleriService,
  PublicBasvuruTuru,
} from './basvuru-turleri.service';

@Controller('basvuru-turleri')
export class BasvuruTurleriController {
  constructor(private readonly basvuruTurleriService: BasvuruTurleriService) {}

  @Get()
  findAll(): Promise<PublicBasvuruTuru[]> {
    return this.basvuruTurleriService.findAllAktif();
  }
}
