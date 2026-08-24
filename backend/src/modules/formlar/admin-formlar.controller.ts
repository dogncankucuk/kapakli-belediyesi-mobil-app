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
import { AdminFormBelgesi, AdminFormlarService } from './admin-formlar.service';
import { CreateFormBelgesiDto } from './dto/create-form-belgesi.dto';
import { UpdateFormBelgesiDto } from './dto/update-form-belgesi.dto';

@Controller('admin-api/formlar')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminFormlarController {
  constructor(private readonly adminFormlarService: AdminFormlarService) {}

  @Get()
  @RequirePermission('formlar', 'list')
  findAll(): Promise<AdminFormBelgesi[]> {
    return this.adminFormlarService.findAll();
  }

  @Get(':id')
  @RequirePermission('formlar', 'show')
  async findOne(@Param('id') id: string): Promise<AdminFormBelgesi> {
    const form = await this.adminFormlarService.findOne(id);
    if (!form) {
      throw new NotFoundException();
    }
    return form;
  }

  @Post()
  @RequirePermission('formlar', 'create')
  create(
    @Body() dto: CreateFormBelgesiDto,
    @Req() req: Request,
  ): Promise<AdminFormBelgesi> {
    return this.adminFormlarService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('formlar', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFormBelgesiDto,
    @Req() req: Request,
  ): Promise<AdminFormBelgesi> {
    const updated = await this.adminFormlarService.update(
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
  @RequirePermission('formlar', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminFormlarService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
