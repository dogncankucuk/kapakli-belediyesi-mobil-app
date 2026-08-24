import { Controller, Get } from '@nestjs/common';

import {
  FaturaOdemeService,
  PublicFaturaOdemeKurumu,
} from './fatura-odeme.service';

@Controller('fatura-odeme')
export class FaturaOdemeController {
  constructor(private readonly faturaOdemeService: FaturaOdemeService) {}

  @Get()
  findAll(): Promise<PublicFaturaOdemeKurumu[]> {
    return this.faturaOdemeService.findAll();
  }
}
