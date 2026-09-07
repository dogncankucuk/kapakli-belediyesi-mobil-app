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
import { AdminKazi, AdminKaziService } from './admin-kazi.service';
import { CreateKaziDto } from './dto/create-kazi.dto';
import { UpdateKaziDto } from './dto/update-kazi.dto';

@Controller('admin-api/kazi-calismalari')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminKaziController {
  constructor(private readonly adminKaziService: AdminKaziService) {}

  @Get()
  @RequirePermission('kaziCalismalari', 'list')
  findAll(): Promise<AdminKazi[]> {
    return this.adminKaziService.findAll();
  }

  @Get(':id')
  @RequirePermission('kaziCalismalari', 'show')
  async findOne(@Param('id') id: string): Promise<AdminKazi> {
    const kazi = await this.adminKaziService.findOne(id);
    if (!kazi) {
      throw new NotFoundException();
    }
    return kazi;
  }

  @Post()
  @RequirePermission('kaziCalismalari', 'create')
  create(
    @Body() dto: CreateKaziDto,
    @Req() req: Request,
  ): Promise<AdminKazi> {
    return this.adminKaziService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('kaziCalismalari', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateKaziDto,
    @Req() req: Request,
  ): Promise<AdminKazi> {
    const updated = await this.adminKaziService.update(
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
  @RequirePermission('kaziCalismalari', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminKaziService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
