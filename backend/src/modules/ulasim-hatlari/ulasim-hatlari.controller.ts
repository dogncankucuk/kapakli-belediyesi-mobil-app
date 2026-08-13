import { Controller, Get, Param } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import {
  PublicUlasimHatti,
  UlasimHatlariService,
} from './ulasim-hatlari.service';
import { CanliOtobus } from './tekulas-canli-takip.service';

@Controller('ulasim-hatlari')
export class UlasimHatlariController {
  constructor(private readonly ulasimHatlariService: UlasimHatlariService) {}

  @Get()
  findAll(): Promise<PublicUlasimHatti[]> {
    return this.ulasimHatlariService.findAll();
  }

  // 30 saniyede bir otomatik yenilenen bir ekrandan cagrilacagi icin diger
  // public POST uc noktalarindan daha gevsek bir limit (dakikada 20).
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Get(':id/canli')
  getCanli(@Param('id') id: string): Promise<CanliOtobus[]> {
    return this.ulasimHatlariService.getCanliOtobusler(id);
  }
}
