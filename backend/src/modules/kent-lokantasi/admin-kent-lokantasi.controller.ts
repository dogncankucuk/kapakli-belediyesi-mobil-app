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
import {
  AdminGununMenusu,
  AdminKentLokantasiService,
} from './admin-kent-lokantasi.service';
import { CreateGununMenusuDto } from './dto/create-gunun-menusu.dto';
import { UpdateGununMenusuDto } from './dto/update-gunun-menusu.dto';

@Controller('admin-api/kent-lokantasi')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminKentLokantasiController {
  constructor(
    private readonly adminKentLokantasiService: AdminKentLokantasiService,
  ) {}

  @Get()
  @RequirePermission('kentLokantasi', 'list')
  findAll(): Promise<AdminGununMenusu[]> {
    return this.adminKentLokantasiService.findAll();
  }

  @Get(':id')
  @RequirePermission('kentLokantasi', 'show')
  async findOne(@Param('id') id: string): Promise<AdminGununMenusu> {
    const menu = await this.adminKentLokantasiService.findOne(id);
    if (!menu) {
      throw new NotFoundException();
    }
    return menu;
  }

  @Post()
  @RequirePermission('kentLokantasi', 'create')
  create(
    @Body() dto: CreateGununMenusuDto,
    @Req() req: Request,
  ): Promise<AdminGununMenusu> {
    return this.adminKentLokantasiService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('kentLokantasi', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGununMenusuDto,
    @Req() req: Request,
  ): Promise<AdminGununMenusu> {
    const updated = await this.adminKentLokantasiService.update(
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
  @RequirePermission('kentLokantasi', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminKentLokantasiService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
