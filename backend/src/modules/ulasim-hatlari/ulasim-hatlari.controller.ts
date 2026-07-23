import { Controller, Get } from '@nestjs/common';

import {
  PublicUlasimHatti,
  UlasimHatlariService,
} from './ulasim-hatlari.service';

@Controller('ulasim-hatlari')
export class UlasimHatlariController {
  constructor(private readonly ulasimHatlariService: UlasimHatlariService) {}

  @Get()
  findAll(): Promise<PublicUlasimHatti[]> {
    return this.ulasimHatlariService.findAll();
  }
}
