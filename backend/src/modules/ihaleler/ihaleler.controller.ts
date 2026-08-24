import { Controller, Get } from '@nestjs/common';

import { IhalelerService, PublicIhale } from './ihaleler.service';

@Controller('ihaleler')
export class IhalelerController {
  constructor(private readonly ihalelerService: IhalelerService) {}

  @Get()
  findAll(): Promise<PublicIhale[]> {
    return this.ihalelerService.findAll();
  }
}
