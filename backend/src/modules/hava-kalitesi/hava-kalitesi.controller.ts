import { Controller, Get } from '@nestjs/common';

import {
  HavaKalitesiService,
  PublicHavaKalitesi,
} from './hava-kalitesi.service';

@Controller('hava-kalitesi')
export class HavaKalitesiController {
  constructor(private readonly havaKalitesiService: HavaKalitesiService) {}

  @Get()
  getCurrent(): Promise<PublicHavaKalitesi> {
    return this.havaKalitesiService.getCurrent();
  }
}
