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
  AdminBasvuruTuru,
  AdminBasvuruTurleriService,
} from './admin-basvuru-turleri.service';
import { CreateBasvuruTuruDto } from './dto/create-basvuru-turu.dto';
import { UpdateBasvuruTuruDto } from './dto/update-basvuru-turu.dto';

@Controller('admin-api/basvuru-turleri')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminBasvuruTurleriController {
  constructor(
    private readonly adminBasvuruTurleriService: AdminBasvuruTurleriService,
  ) {}

  @Get()
  @RequirePermission('basvuruTurleri', 'list')
  findAll(): Promise<AdminBasvuruTuru[]> {
    return this.adminBasvuruTurleriService.findAll();
  }

  @Get(':id')
  @RequirePermission('basvuruTurleri', 'show')
  async findOne(@Param('id') id: string): Promise<AdminBasvuruTuru> {
    const tur = await this.adminBasvuruTurleriService.findOne(id);
    if (!tur) {
      throw new NotFoundException();
    }
    return tur;
  }

  @Post()
  @RequirePermission('basvuruTurleri', 'create')
  create(
    @Body() dto: CreateBasvuruTuruDto,
    @Req() req: Request,
  ): Promise<AdminBasvuruTuru> {
    return this.adminBasvuruTurleriService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('basvuruTurleri', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBasvuruTuruDto,
    @Req() req: Request,
  ): Promise<AdminBasvuruTuru> {
    const updated = await this.adminBasvuruTurleriService.update(
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
  @RequirePermission('basvuruTurleri', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminBasvuruTurleriService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
