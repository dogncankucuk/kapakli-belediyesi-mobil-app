import { Controller, Get } from '@nestjs/common';

import {
  PublicUlasimSecenegi,
  UlasimHizmetleriService,
} from './ulasim-hizmetleri.service';

@Controller('ulasim-hizmetleri')
export class UlasimHizmetleriController {
  constructor(
    private readonly ulasimHizmetleriService: UlasimHizmetleriService,
  ) {}

  @Get()
  findAll(): Promise<PublicUlasimSecenegi[]> {
    return this.ulasimHizmetleriService.findAll();
  }
}
