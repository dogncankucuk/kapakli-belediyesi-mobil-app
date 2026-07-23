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
import { AdminCami, AdminCamilerService } from './admin-camiler.service';
import { CreateCamiDto } from './dto/create-cami.dto';
import { UpdateCamiDto } from './dto/update-cami.dto';

@Controller('admin-api/camiler')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminCamilerController {
  constructor(private readonly adminCamilerService: AdminCamilerService) {}

  @Get()
  @RequirePermission('camiler', 'list')
  findAll(): Promise<AdminCami[]> {
    return this.adminCamilerService.findAll();
  }

  @Get(':id')
  @RequirePermission('camiler', 'show')
  async findOne(@Param('id') id: string): Promise<AdminCami> {
    const cami = await this.adminCamilerService.findOne(id);
    if (!cami) {
      throw new NotFoundException();
    }
    return cami;
  }

  @Post()
  @RequirePermission('camiler', 'create')
  create(@Body() dto: CreateCamiDto, @Req() req: Request): Promise<AdminCami> {
    return this.adminCamilerService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('camiler', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCamiDto,
    @Req() req: Request,
  ): Promise<AdminCami> {
    const updated = await this.adminCamilerService.update(
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
  @RequirePermission('camiler', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminCamilerService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
