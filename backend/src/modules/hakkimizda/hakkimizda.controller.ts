import { Controller, Get } from '@nestjs/common';

import { HakkimizdaService, PublicHakkimizda } from './hakkimizda.service';

@Controller('hakkimizda')
export class HakkimizdaController {
  constructor(private readonly hakkimizdaService: HakkimizdaService) {}

  @Get()
  get(): Promise<PublicHakkimizda> {
    return this.hakkimizdaService.get();
  }
}
