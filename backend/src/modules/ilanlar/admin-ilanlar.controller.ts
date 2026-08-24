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
import { AdminIlan, AdminIlanlarService } from './admin-ilanlar.service';
import { CreateIlanDto } from './dto/create-ilan.dto';
import { UpdateIlanDto } from './dto/update-ilan.dto';

@Controller('admin-api/ilanlar')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminIlanlarController {
  constructor(private readonly adminIlanlarService: AdminIlanlarService) {}

  @Get()
  @RequirePermission('ilanlar', 'list')
  findAll(): Promise<AdminIlan[]> {
    return this.adminIlanlarService.findAll();
  }

  @Get(':id')
  @RequirePermission('ilanlar', 'show')
  async findOne(@Param('id') id: string): Promise<AdminIlan> {
    const ilan = await this.adminIlanlarService.findOne(id);
    if (!ilan) {
      throw new NotFoundException();
    }
    return ilan;
  }

  @Post()
  @RequirePermission('ilanlar', 'create')
  create(@Body() dto: CreateIlanDto, @Req() req: Request): Promise<AdminIlan> {
    return this.adminIlanlarService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('ilanlar', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateIlanDto,
    @Req() req: Request,
  ): Promise<AdminIlan> {
    const updated = await this.adminIlanlarService.update(
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
  @RequirePermission('ilanlar', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminIlanlarService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
