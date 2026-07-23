import { Controller, Get } from '@nestjs/common';

import {
  PublicSehirKamerasi,
  SehirKameralariService,
} from './sehir-kameralari.service';

@Controller('sehir-kameralari')
export class SehirKameralariController {
  constructor(
    private readonly sehirKameralariService: SehirKameralariService,
  ) {}

  @Get()
  findAll(): Promise<PublicSehirKamerasi[]> {
    return this.sehirKameralariService.findAll();
  }
}
