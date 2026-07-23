import { Controller, Get } from '@nestjs/common';

import {
  KentLokantasiService,
  PublicGununMenusu,
} from './kent-lokantasi.service';

@Controller('kent-lokantasi/gunun-menusu')
export class KentLokantasiController {
  constructor(private readonly kentLokantasiService: KentLokantasiService) {}

  @Get()
  findLatest(): Promise<PublicGununMenusu | null> {
    return this.kentLokantasiService.findLatest();
  }
}
