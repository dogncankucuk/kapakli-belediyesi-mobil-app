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
import { AdminAseviBasvuru, AdminAseviService } from './admin-asevi.service';
import { UpdateAseviBasvuruDto } from './dto/update-asevi-basvuru.dto';

@Controller('admin-api/asevi')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminAseviController {
  constructor(private readonly adminAseviService: AdminAseviService) {}

  @Get()
  @RequirePermission('asevi', 'list')
  findAll(): Promise<AdminAseviBasvuru[]> {
    return this.adminAseviService.findAll();
  }

  @Get(':id')
  @RequirePermission('asevi', 'show')
  async findOne(@Param('id') id: string): Promise<AdminAseviBasvuru> {
    const basvuru = await this.adminAseviService.findOne(id);
    if (!basvuru) {
      throw new NotFoundException();
    }
    return basvuru;
  }

  @Patch(':id')
  @RequirePermission('asevi', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAseviBasvuruDto,
    @Req() req: Request,
  ): Promise<AdminAseviBasvuru> {
    const updated = await this.adminAseviService.update(
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
  @RequirePermission('asevi', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminAseviService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
