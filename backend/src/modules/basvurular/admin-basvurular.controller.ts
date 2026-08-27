import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminBasvuru,
  AdminBasvurularService,
} from './admin-basvurular.service';
import { UpdateBasvuruDto } from './dto/update-basvuru.dto';

@Controller('admin-api/basvurular')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminBasvurularController {
  constructor(
    private readonly adminBasvurularService: AdminBasvurularService,
  ) {}

  @Get()
  @RequirePermission('basvurular', 'list')
  findAll(): Promise<AdminBasvuru[]> {
    return this.adminBasvurularService.findAll();
  }

  @Get(':id')
  @RequirePermission('basvurular', 'show')
  async findOne(@Param('id') id: string): Promise<AdminBasvuru> {
    const basvuru = await this.adminBasvurularService.findOne(id);
    if (!basvuru) {
      throw new NotFoundException();
    }
    return basvuru;
  }

  @Patch(':id')
  @RequirePermission('basvurular', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBasvuruDto,
    @Req() req: Request,
  ): Promise<AdminBasvuru> {
    const updated = await this.adminBasvurularService.update(
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
  @RequirePermission('basvurular', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminBasvurularService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
