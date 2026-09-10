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
  AdminSaglikKurumu,
  AdminSaglikService,
} from './admin-saglik.service';
import { CreateSaglikKurumuDto } from './dto/create-saglik-kurumu.dto';
import { UpdateSaglikKurumuDto } from './dto/update-saglik-kurumu.dto';

@Controller('admin-api/saglik')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminSaglikController {
  constructor(private readonly adminSaglikService: AdminSaglikService) {}

  @Get()
  @RequirePermission('saglik', 'list')
  findAll(): Promise<AdminSaglikKurumu[]> {
    return this.adminSaglikService.findAll();
  }

  @Get(':id')
  @RequirePermission('saglik', 'show')
  async findOne(@Param('id') id: string): Promise<AdminSaglikKurumu> {
    const kurum = await this.adminSaglikService.findOne(id);
    if (!kurum) {
      throw new NotFoundException();
    }
    return kurum;
  }

  @Post()
  @RequirePermission('saglik', 'create')
  create(
    @Body() dto: CreateSaglikKurumuDto,
    @Req() req: Request,
  ): Promise<AdminSaglikKurumu> {
    return this.adminSaglikService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('saglik', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSaglikKurumuDto,
    @Req() req: Request,
  ): Promise<AdminSaglikKurumu> {
    const updated = await this.adminSaglikService.update(
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
  @RequirePermission('saglik', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminSaglikService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }

  @Post('cbs-senkronize')
  @RequirePermission('saglik', 'create')
  cbsSenkronize(@Req() req: Request): Promise<CbsSenkronizeSonucu> {
    return this.adminSaglikService.cbsSenkronize(req.session.adminUser!.email);
  }

  @Post('eczane-ice-aktar')
  @RequirePermission('saglik', 'create')
  eczanelerdenIceAktar(@Req() req: Request): Promise<CbsSenkronizeSonucu> {
    return this.adminSaglikService.eczanelerdenIceAktar(
      req.session.adminUser!.email,
    );
  }
}
