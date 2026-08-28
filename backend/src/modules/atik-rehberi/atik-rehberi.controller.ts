import { Controller, Get } from '@nestjs/common';

import {
  AtikRehberiService,
  PublicAtikRehberiIcerik,
} from './atik-rehberi.service';

@Controller('atik-rehberi')
export class AtikRehberiController {
  constructor(private readonly atikRehberiService: AtikRehberiService) {}

  @Get()
  findAll(): Promise<PublicAtikRehberiIcerik[]> {
    return this.atikRehberiService.findAll();
  }
}
