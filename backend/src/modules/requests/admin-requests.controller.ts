import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminRequest,
  AdminRequestsService,
  PagedAdminRequests,
} from './admin-requests.service';
import { ListRequestsQueryDto } from './dto/list-requests-query.dto';
import { UpdateRequestDto } from './dto/update-request.dto';

@Controller('admin-api/requests')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminRequestsController {
  constructor(private readonly adminRequestsService: AdminRequestsService) {}

  @Get()
  @RequirePermission('requests', 'list')
  findAll(@Query() query: ListRequestsQueryDto): Promise<PagedAdminRequests> {
    return this.adminRequestsService.findAll(query);
  }

  @Get(':id')
  @RequirePermission('requests', 'show')
  async findOne(@Param('id') id: string): Promise<AdminRequest> {
    const request = await this.adminRequestsService.findOne(id);
    if (!request) {
      throw new NotFoundException();
    }
    return request;
  }

  @Patch(':id')
  @RequirePermission('requests', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
    @Req() req: Request,
  ): Promise<AdminRequest> {
    const updated = await this.adminRequestsService.update(
      id,
      dto,
      req.session.adminUser!.email,
    );
    if (!updated) {
      throw new NotFoundException();
    }
    return updated;
  }

  @Delete(':id')
  @RequirePermission('requests', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminRequestsService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
