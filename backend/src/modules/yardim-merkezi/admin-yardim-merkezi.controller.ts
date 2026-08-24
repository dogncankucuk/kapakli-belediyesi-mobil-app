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
  AdminYardimMerkeziSoru,
  AdminYardimMerkeziService,
} from './admin-yardim-merkezi.service';
import { CreateYardimMerkeziSoruDto } from './dto/create-yardim-merkezi-soru.dto';
import { UpdateYardimMerkeziSoruDto } from './dto/update-yardim-merkezi-soru.dto';

@Controller('admin-api/yardim-merkezi')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminYardimMerkeziController {
  constructor(
    private readonly adminYardimMerkeziService: AdminYardimMerkeziService,
  ) {}

  @Get()
  @RequirePermission('yardimMerkezi', 'list')
  findAll(): Promise<AdminYardimMerkeziSoru[]> {
    return this.adminYardimMerkeziService.findAll();
  }

  @Get(':id')
  @RequirePermission('yardimMerkezi', 'show')
  async findOne(@Param('id') id: string): Promise<AdminYardimMerkeziSoru> {
    const soru = await this.adminYardimMerkeziService.findOne(id);
    if (!soru) {
      throw new NotFoundException();
    }
    return soru;
  }

  @Post()
  @RequirePermission('yardimMerkezi', 'create')
  create(
    @Body() dto: CreateYardimMerkeziSoruDto,
    @Req() req: Request,
  ): Promise<AdminYardimMerkeziSoru> {
    return this.adminYardimMerkeziService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('yardimMerkezi', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateYardimMerkeziSoruDto,
    @Req() req: Request,
  ): Promise<AdminYardimMerkeziSoru> {
    const updated = await this.adminYardimMerkeziService.update(
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
  @RequirePermission('yardimMerkezi', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminYardimMerkeziService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
