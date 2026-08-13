import { Controller, Get } from '@nestjs/common';

import {
  AtikNoktalariService,
  PublicAtikNoktasi,
} from './atik-noktalari.service';

@Controller('atik-noktalari')
export class AtikNoktalariController {
  constructor(private readonly atikNoktalariService: AtikNoktalariService) {}

  @Get()
  findAll(): Promise<PublicAtikNoktasi[]> {
    return this.atikNoktalariService.findAll();
  }
}
