import { Controller, Get } from '@nestjs/common';

import { PublicTarihiYer, TarihiYerlerService } from './tarihi-yerler.service';

@Controller('tarihi-yerler')
export class TarihiYerlerController {
  constructor(private readonly tarihiYerlerService: TarihiYerlerService) {}

  @Get()
  findAll(): Promise<PublicTarihiYer[]> {
    return this.tarihiYerlerService.findAll();
  }
}
