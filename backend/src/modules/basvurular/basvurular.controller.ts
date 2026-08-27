import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { BasvurularService, PublicBasvuru } from './basvurular.service';
import { CreateBasvuruDto } from './dto/create-basvuru.dto';

@Controller('basvurular')
export class BasvurularController {
  constructor(private readonly basvurularService: BasvurularService) {}

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post()
  create(@Body() dto: CreateBasvuruDto): Promise<PublicBasvuru> {
    return this.basvurularService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PublicBasvuru> {
    return this.basvurularService.findOne(id);
  }
}
