import { Controller, Get } from '@nestjs/common';

import { PublicVefatIlani, VefatEdenlerService } from './vefat-edenler.service';

@Controller('vefat-edenler')
export class VefatEdenlerController {
  constructor(private readonly vefatEdenlerService: VefatEdenlerService) {}

  @Get()
  findRecent(): Promise<PublicVefatIlani[]> {
    return this.vefatEdenlerService.findRecent();
  }
}
