import { Controller, Get } from '@nestjs/common';

import { MakalelerService, PublicMakale } from './makaleler.service';

@Controller('makaleler')
export class MakalelerController {
  constructor(private readonly makalelerService: MakalelerService) {}

  @Get()
  findAll(): Promise<PublicMakale[]> {
    return this.makalelerService.findAll();
  }
}
