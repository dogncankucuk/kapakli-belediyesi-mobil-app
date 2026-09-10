import { Controller, Get } from '@nestjs/common';

import { EgitimService, PublicEgitimKurumu } from './egitim.service';

@Controller('egitim')
export class EgitimController {
  constructor(private readonly egitimService: EgitimService) {}

  @Get()
  findAll(): Promise<PublicEgitimKurumu[]> {
    return this.egitimService.findAll();
  }
}
