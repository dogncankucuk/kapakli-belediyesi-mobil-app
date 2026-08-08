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
import { AdminPark, AdminParklarService } from './admin-parklar.service';
import { CreateParkDto } from './dto/create-park.dto';
import { UpdateParkDto } from './dto/update-park.dto';

@Controller('admin-api/parklar')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminParklarController {
  constructor(private readonly adminParklarService: AdminParklarService) {}

  @Get()
  @RequirePermission('parklar', 'list')
  findAll(): Promise<AdminPark[]> {
    return this.adminParklarService.findAll();
  }

  @Get(':id')
  @RequirePermission('parklar', 'show')
  async findOne(@Param('id') id: string): Promise<AdminPark> {
    const park = await this.adminParklarService.findOne(id);
    if (!park) {
      throw new NotFoundException();
    }
    return park;
  }

  @Post()
  @RequirePermission('parklar', 'create')
  create(@Body() dto: CreateParkDto, @Req() req: Request): Promise<AdminPark> {
    return this.adminParklarService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('parklar', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateParkDto,
    @Req() req: Request,
  ): Promise<AdminPark> {
    const updated = await this.adminParklarService.update(
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
  @RequirePermission('parklar', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminParklarService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
