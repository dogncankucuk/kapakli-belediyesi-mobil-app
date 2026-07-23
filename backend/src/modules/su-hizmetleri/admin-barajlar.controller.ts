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
import { AdminBaraj, AdminBarajlarService } from './admin-barajlar.service';
import { CreateBarajDto } from './dto/create-baraj.dto';
import { UpdateBarajDto } from './dto/update-baraj.dto';

@Controller('admin-api/barajlar')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminBarajlarController {
  constructor(private readonly adminBarajlarService: AdminBarajlarService) {}

  @Get()
  @RequirePermission('suHizmetleri', 'list')
  findAll(): Promise<AdminBaraj[]> {
    return this.adminBarajlarService.findAll();
  }

  @Get(':id')
  @RequirePermission('suHizmetleri', 'show')
  async findOne(@Param('id') id: string): Promise<AdminBaraj> {
    const baraj = await this.adminBarajlarService.findOne(id);
    if (!baraj) {
      throw new NotFoundException();
    }
    return baraj;
  }

  @Post()
  @RequirePermission('suHizmetleri', 'create')
  create(
    @Body() dto: CreateBarajDto,
    @Req() req: Request,
  ): Promise<AdminBaraj> {
    return this.adminBarajlarService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('suHizmetleri', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBarajDto,
    @Req() req: Request,
  ): Promise<AdminBaraj> {
    const updated = await this.adminBarajlarService.update(
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
  @RequirePermission('suHizmetleri', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminBarajlarService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
