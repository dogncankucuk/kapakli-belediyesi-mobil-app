import { Controller, Get } from '@nestjs/common';

import {
  OnemliKurumlarService,
  PublicOnemliKurum,
} from './onemli-kurumlar.service';

@Controller('onemli-kurumlar')
export class OnemliKurumlarController {
  constructor(private readonly onemliKurumlarService: OnemliKurumlarService) {}

  @Get()
  findAll(): Promise<PublicOnemliKurum[]> {
    return this.onemliKurumlarService.findAll();
  }
}
