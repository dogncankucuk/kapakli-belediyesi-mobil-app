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
  AdminFaturaOdemeKurumu,
  AdminFaturaOdemeService,
} from './admin-fatura-odeme.service';
import { CreateFaturaOdemeKurumuDto } from './dto/create-fatura-odeme-kurumu.dto';
import { UpdateFaturaOdemeKurumuDto } from './dto/update-fatura-odeme-kurumu.dto';

@Controller('admin-api/fatura-odeme')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminFaturaOdemeController {
  constructor(
    private readonly adminFaturaOdemeService: AdminFaturaOdemeService,
  ) {}

  @Get()
  @RequirePermission('faturaOdeme', 'list')
  findAll(): Promise<AdminFaturaOdemeKurumu[]> {
    return this.adminFaturaOdemeService.findAll();
  }

  @Get(':id')
  @RequirePermission('faturaOdeme', 'show')
  async findOne(@Param('id') id: string): Promise<AdminFaturaOdemeKurumu> {
    const kurum = await this.adminFaturaOdemeService.findOne(id);
    if (!kurum) {
      throw new NotFoundException();
    }
    return kurum;
  }

  @Post()
  @RequirePermission('faturaOdeme', 'create')
  create(
    @Body() dto: CreateFaturaOdemeKurumuDto,
    @Req() req: Request,
  ): Promise<AdminFaturaOdemeKurumu> {
    return this.adminFaturaOdemeService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('faturaOdeme', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFaturaOdemeKurumuDto,
    @Req() req: Request,
  ): Promise<AdminFaturaOdemeKurumu> {
    const updated = await this.adminFaturaOdemeService.update(
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
  @RequirePermission('faturaOdeme', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminFaturaOdemeService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
