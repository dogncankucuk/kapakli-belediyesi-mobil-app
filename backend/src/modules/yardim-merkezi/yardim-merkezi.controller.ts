import { Controller, Get } from '@nestjs/common';

import {
  PublicYardimMerkeziSoru,
  YardimMerkeziService,
} from './yardim-merkezi.service';

@Controller('yardim-merkezi')
export class YardimMerkeziController {
  constructor(private readonly yardimMerkeziService: YardimMerkeziService) {}

  @Get()
  findAll(): Promise<PublicYardimMerkeziSoru[]> {
    return this.yardimMerkeziService.findAll();
  }
}
