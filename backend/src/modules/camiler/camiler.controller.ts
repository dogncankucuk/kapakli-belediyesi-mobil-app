import { Controller, Get } from '@nestjs/common';

import { CamilerService, PublicCami } from './camiler.service';

@Controller('camiler')
export class CamilerController {
  constructor(private readonly camilerService: CamilerService) {}

  @Get()
  findAll(): Promise<PublicCami[]> {
    return this.camilerService.findAll();
  }
}
