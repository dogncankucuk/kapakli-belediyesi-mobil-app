import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CreateRequestDto } from './dto/create-request.dto';
import { PublicRequest, RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  create(@Body() dto: CreateRequestDto): Promise<PublicRequest> {
    return this.requestsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PublicRequest> {
    return this.requestsService.findOne(id);
  }
}
