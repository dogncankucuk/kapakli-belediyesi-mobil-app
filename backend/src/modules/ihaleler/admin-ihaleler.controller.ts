import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import { AdminIhale, AdminIhalelerService } from './admin-ihaleler.service';
import { CreateIhaleDto } from './dto/create-ihale.dto';
import { UpdateIhaleDto } from './dto/update-ihale.dto';

@Controller('admin-api/ihaleler')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminIhalelerController {
  constructor(private readonly adminIhalelerService: AdminIhalelerService) {}

  @Get()
  @RequirePermission('ihaleler', 'list')
  findAll(): Promise<AdminIhale[]> {
    return this.adminIhalelerService.findAll();
  }

  @Get(':id')
  @RequirePermission('ihaleler', 'show')
  async findOne(@Param('id') id: string): Promise<AdminIhale> {
    const ihale = await this.adminIhalelerService.findOne(id);
    if (!ihale) {
      throw new NotFoundException();
    }
    return ihale;
  }

  @Post()
  @RequirePermission('ihaleler', 'create')
  create(@Body() dto: CreateIhaleDto, @Req() req: Request): Promise<AdminIhale> {
    return this.adminIhalelerService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('ihaleler', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIhaleDto,
    @Req() req: Request,
  ): Promise<AdminIhale> {
    const updated = await this.adminIhalelerService.update(
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
  @RequirePermission('ihaleler', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminIhalelerService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
