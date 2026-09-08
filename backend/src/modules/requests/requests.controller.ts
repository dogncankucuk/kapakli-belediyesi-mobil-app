import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { OptionalJwtAuthGuard } from '../users/optional-jwt-auth.guard';
import type { OptionalAuthenticatedRequest } from '../users/optional-jwt-auth.guard';
import { CreateRequestDto } from './dto/create-request.dto';
import { PublicRequest, RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateRequestDto,
    @Req() request: OptionalAuthenticatedRequest,
  ): Promise<PublicRequest> {
    return this.requestsService.create(dto, request.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PublicRequest> {
    return this.requestsService.findOne(id);
  }
}
