import { Controller, Get } from '@nestjs/common';

import { BaskanService, PublicBaskan } from './baskan.service';

@Controller('baskan')
export class BaskanController {
  constructor(private readonly baskanService: BaskanService) {}

  @Get()
  get(): Promise<PublicBaskan> {
    return this.baskanService.get();
  }
}
