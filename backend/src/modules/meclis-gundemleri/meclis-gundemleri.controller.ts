import { Controller, Get } from '@nestjs/common';

import {
  MeclisGundemleriService,
  PublicMeclisGundemi,
} from './meclis-gundemleri.service';

@Controller('meclis-gundemleri')
export class MeclisGundemleriController {
  constructor(
    private readonly meclisGundemleriService: MeclisGundemleriService,
  ) {}

  @Get()
  findAll(): Promise<PublicMeclisGundemi[]> {
    return this.meclisGundemleriService.findAll();
  }
}
