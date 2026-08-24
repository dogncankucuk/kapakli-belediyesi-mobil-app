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
import { AdminMakale, AdminMakalelerService } from './admin-makaleler.service';
import { CreateMakaleDto } from './dto/create-makale.dto';
import { UpdateMakaleDto } from './dto/update-makale.dto';

@Controller('admin-api/makaleler')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminMakalelerController {
  constructor(private readonly adminMakalelerService: AdminMakalelerService) {}

  @Get()
  @RequirePermission('makaleler', 'list')
  findAll(): Promise<AdminMakale[]> {
    return this.adminMakalelerService.findAll();
  }

  @Get(':id')
  @RequirePermission('makaleler', 'show')
  async findOne(@Param('id') id: string): Promise<AdminMakale> {
    const makale = await this.adminMakalelerService.findOne(id);
    if (!makale) {
      throw new NotFoundException();
    }
    return makale;
  }

  @Post()
  @RequirePermission('makaleler', 'create')
  create(@Body() dto: CreateMakaleDto, @Req() req: Request): Promise<AdminMakale> {
    return this.adminMakalelerService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('makaleler', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMakaleDto,
    @Req() req: Request,
  ): Promise<AdminMakale> {
    const updated = await this.adminMakalelerService.update(
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
  @RequirePermission('makaleler', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminMakalelerService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
