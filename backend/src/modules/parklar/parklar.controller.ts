import { Controller, Get } from '@nestjs/common';

import { ParklarService, PublicPark } from './parklar.service';

@Controller('parklar')
export class ParklarController {
  constructor(private readonly parklarService: ParklarService) {}

  @Get()
  findAll(): Promise<PublicPark[]> {
    return this.parklarService.findAll();
  }
}
