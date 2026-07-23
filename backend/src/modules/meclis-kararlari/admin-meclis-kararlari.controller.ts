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
  AdminMeclisKarari,
  AdminMeclisKararlariService,
} from './admin-meclis-kararlari.service';
import { CreateMeclisKarariDto } from './dto/create-meclis-karari.dto';
import { UpdateMeclisKarariDto } from './dto/update-meclis-karari.dto';

@Controller('admin-api/meclis-kararlari')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminMeclisKararlariController {
  constructor(
    private readonly adminMeclisKararlariService: AdminMeclisKararlariService,
  ) {}

  @Get()
  @RequirePermission('meclisKararlari', 'list')
  findAll(): Promise<AdminMeclisKarari[]> {
    return this.adminMeclisKararlariService.findAll();
  }

  @Get(':id')
  @RequirePermission('meclisKararlari', 'show')
  async findOne(@Param('id') id: string): Promise<AdminMeclisKarari> {
    const karar = await this.adminMeclisKararlariService.findOne(id);
    if (!karar) {
      throw new NotFoundException();
    }
    return karar;
  }

  @Post()
  @RequirePermission('meclisKararlari', 'create')
  create(
    @Body() dto: CreateMeclisKarariDto,
    @Req() req: Request,
  ): Promise<AdminMeclisKarari> {
    return this.adminMeclisKararlariService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('meclisKararlari', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMeclisKarariDto,
    @Req() req: Request,
  ): Promise<AdminMeclisKarari> {
    const updated = await this.adminMeclisKararlariService.update(
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
  @RequirePermission('meclisKararlari', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminMeclisKararlariService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
