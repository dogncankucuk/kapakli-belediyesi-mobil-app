import { Controller, Get } from '@nestjs/common';

import { SaglikService, PublicSaglikKurumu } from './saglik.service';

@Controller('saglik')
export class SaglikController {
  constructor(private readonly saglikService: SaglikService) {}

  @Get()
  findAll(): Promise<PublicSaglikKurumu[]> {
    return this.saglikService.findAll();
  }
}
