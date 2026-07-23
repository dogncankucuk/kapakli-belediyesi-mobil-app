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
  AdminSehirKamerasi,
  AdminSehirKameralariService,
} from './admin-sehir-kameralari.service';
import { CreateSehirKamerasiDto } from './dto/create-sehir-kamerasi.dto';
import { UpdateSehirKamerasiDto } from './dto/update-sehir-kamerasi.dto';

@Controller('admin-api/sehir-kameralari')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminSehirKameralariController {
  constructor(
    private readonly adminSehirKameralariService: AdminSehirKameralariService,
  ) {}

  @Get()
  @RequirePermission('sehirKameralari', 'list')
  findAll(): Promise<AdminSehirKamerasi[]> {
    return this.adminSehirKameralariService.findAll();
  }

  @Get(':id')
  @RequirePermission('sehirKameralari', 'show')
  async findOne(@Param('id') id: string): Promise<AdminSehirKamerasi> {
    const kamera = await this.adminSehirKameralariService.findOne(id);
    if (!kamera) {
      throw new NotFoundException();
    }
    return kamera;
  }

  @Post()
  @RequirePermission('sehirKameralari', 'create')
  create(
    @Body() dto: CreateSehirKamerasiDto,
    @Req() req: Request,
  ): Promise<AdminSehirKamerasi> {
    return this.adminSehirKameralariService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('sehirKameralari', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSehirKamerasiDto,
    @Req() req: Request,
  ): Promise<AdminSehirKamerasi> {
    const updated = await this.adminSehirKameralariService.update(
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
  @RequirePermission('sehirKameralari', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminSehirKameralariService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
