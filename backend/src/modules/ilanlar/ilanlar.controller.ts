import { Controller, Get } from '@nestjs/common';

import { IlanlarService, PublicIlan } from './ilanlar.service';

@Controller('ilanlar')
export class IlanlarController {
  constructor(private readonly ilanlarService: IlanlarService) {}

  @Get()
  findAll(): Promise<PublicIlan[]> {
    return this.ilanlarService.findAll();
  }
}
