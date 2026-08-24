import { Controller, Get } from '@nestjs/common';

import { PublicTemaAyarlari, TemaAyarlariService } from './tema-ayarlari.service';

@Controller('tema-ayarlari')
export class TemaAyarlariController {
  constructor(private readonly temaAyarlariService: TemaAyarlariService) {}

  @Get()
  get(): Promise<PublicTemaAyarlari> {
    return this.temaAyarlariService.get();
  }
}
