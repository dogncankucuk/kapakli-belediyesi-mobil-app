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
import { AdminHaber, AdminHaberlerService } from './admin-haberler.service';
import { CreateHaberDto } from './dto/create-haber.dto';
import { UpdateHaberDto } from './dto/update-haber.dto';

@Controller('admin-api/haberler')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminHaberlerController {
  constructor(private readonly adminHaberlerService: AdminHaberlerService) {}

  @Get()
  @RequirePermission('haberler', 'list')
  findAll(): Promise<AdminHaber[]> {
    return this.adminHaberlerService.findAll();
  }

  @Get(':id')
  @RequirePermission('haberler', 'show')
  async findOne(@Param('id') id: string): Promise<AdminHaber> {
    const haber = await this.adminHaberlerService.findOne(id);
    if (!haber) {
      throw new NotFoundException();
    }
    return haber;
  }

  @Post()
  @RequirePermission('haberler', 'create')
  create(@Body() dto: CreateHaberDto, @Req() req: Request): Promise<AdminHaber> {
    return this.adminHaberlerService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('haberler', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateHaberDto,
    @Req() req: Request,
  ): Promise<AdminHaber> {
    const updated = await this.adminHaberlerService.update(
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
  @RequirePermission('haberler', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminHaberlerService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
