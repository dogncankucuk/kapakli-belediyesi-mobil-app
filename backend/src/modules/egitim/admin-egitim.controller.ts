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
import { CbsSenkronizeSonucu } from '../cbs/cbs-kaynak.service';
import {
  AdminEgitimKurumu,
  AdminEgitimService,
} from './admin-egitim.service';
import { CreateEgitimKurumuDto } from './dto/create-egitim-kurumu.dto';
import { UpdateEgitimKurumuDto } from './dto/update-egitim-kurumu.dto';

@Controller('admin-api/egitim')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminEgitimController {
  constructor(private readonly adminEgitimService: AdminEgitimService) {}

  @Get()
  @RequirePermission('egitim', 'list')
  findAll(): Promise<AdminEgitimKurumu[]> {
    return this.adminEgitimService.findAll();
  }

  @Get(':id')
  @RequirePermission('egitim', 'show')
  async findOne(@Param('id') id: string): Promise<AdminEgitimKurumu> {
    const kurum = await this.adminEgitimService.findOne(id);
    if (!kurum) {
      throw new NotFoundException();
    }
    return kurum;
  }

  @Post()
  @RequirePermission('egitim', 'create')
  create(
    @Body() dto: CreateEgitimKurumuDto,
    @Req() req: Request,
  ): Promise<AdminEgitimKurumu> {
    return this.adminEgitimService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('egitim', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEgitimKurumuDto,
    @Req() req: Request,
  ): Promise<AdminEgitimKurumu> {
    const updated = await this.adminEgitimService.update(
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
  @RequirePermission('egitim', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminEgitimService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }

  @Post('cbs-senkronize')
  @RequirePermission('egitim', 'create')
  cbsSenkronize(@Req() req: Request): Promise<CbsSenkronizeSonucu> {
    return this.adminEgitimService.cbsSenkronize(req.session.adminUser!.email);
  }
}
