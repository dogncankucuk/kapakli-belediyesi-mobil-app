import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { OptionalJwtAuthGuard } from '../users/optional-jwt-auth.guard';
import type { OptionalAuthenticatedRequest } from '../users/optional-jwt-auth.guard';
import { BasvurularService, PublicBasvuru } from './basvurular.service';
import { CreateBasvuruDto } from './dto/create-basvuru.dto';

@Controller('basvurular')
export class BasvurularController {
  constructor(private readonly basvurularService: BasvurularService) {}

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateBasvuruDto,
    @Req() request: OptionalAuthenticatedRequest,
  ): Promise<PublicBasvuru> {
    return this.basvurularService.create(dto, request.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PublicBasvuru> {
    return this.basvurularService.findOne(id);
  }
}
