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
  AdminBasvuruHizmeti,
  AdminBasvuruHizmetleriService,
} from './admin-basvuru-hizmetleri.service';
import { CreateBasvuruHizmetiDto } from './dto/create-basvuru-hizmeti.dto';
import { UpdateBasvuruHizmetiDto } from './dto/update-basvuru-hizmeti.dto';

@Controller('admin-api/basvuru-hizmetleri')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminBasvuruHizmetleriController {
  constructor(
    private readonly adminBasvuruHizmetleriService: AdminBasvuruHizmetleriService,
  ) {}

  @Get()
  @RequirePermission('basvuruHizmetleri', 'list')
  findAll(): Promise<AdminBasvuruHizmeti[]> {
    return this.adminBasvuruHizmetleriService.findAll();
  }

  @Get(':id')
  @RequirePermission('basvuruHizmetleri', 'show')
  async findOne(@Param('id') id: string): Promise<AdminBasvuruHizmeti> {
    const hizmet = await this.adminBasvuruHizmetleriService.findOne(id);
    if (!hizmet) {
      throw new NotFoundException();
    }
    return hizmet;
  }

  @Post()
  @RequirePermission('basvuruHizmetleri', 'create')
  create(
    @Body() dto: CreateBasvuruHizmetiDto,
    @Req() req: Request,
  ): Promise<AdminBasvuruHizmeti> {
    return this.adminBasvuruHizmetleriService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('basvuruHizmetleri', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBasvuruHizmetiDto,
    @Req() req: Request,
  ): Promise<AdminBasvuruHizmeti> {
    const updated = await this.adminBasvuruHizmetleriService.update(
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
  @RequirePermission('basvuruHizmetleri', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminBasvuruHizmetleriService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
