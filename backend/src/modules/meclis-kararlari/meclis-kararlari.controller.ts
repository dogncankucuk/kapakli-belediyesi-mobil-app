import { Controller, Get } from '@nestjs/common';

import {
  MeclisKararlariService,
  PublicMeclisKarari,
} from './meclis-kararlari.service';

@Controller('meclis-kararlari')
export class MeclisKararlariController {
  constructor(
    private readonly meclisKararlariService: MeclisKararlariService,
  ) {}

  @Get()
  findAll(): Promise<PublicMeclisKarari[]> {
    return this.meclisKararlariService.findAll();
  }
}
