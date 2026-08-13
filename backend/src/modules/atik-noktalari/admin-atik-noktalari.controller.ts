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
  AdminAtikNoktasi,
  AdminAtikNoktalariService,
} from './admin-atik-noktalari.service';
import { CreateAtikNoktasiDto } from './dto/create-atik-noktasi.dto';
import { UpdateAtikNoktasiDto } from './dto/update-atik-noktasi.dto';

@Controller('admin-api/atik-noktalari')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminAtikNoktalariController {
  constructor(
    private readonly adminAtikNoktalariService: AdminAtikNoktalariService,
  ) {}

  @Get()
  @RequirePermission('atikNoktalari', 'list')
  findAll(): Promise<AdminAtikNoktasi[]> {
    return this.adminAtikNoktalariService.findAll();
  }

  @Get(':id')
  @RequirePermission('atikNoktalari', 'show')
  async findOne(@Param('id') id: string): Promise<AdminAtikNoktasi> {
    const nokta = await this.adminAtikNoktalariService.findOne(id);
    if (!nokta) {
      throw new NotFoundException();
    }
    return nokta;
  }

  @Post()
  @RequirePermission('atikNoktalari', 'create')
  create(
    @Body() dto: CreateAtikNoktasiDto,
    @Req() req: Request,
  ): Promise<AdminAtikNoktasi> {
    return this.adminAtikNoktalariService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('atikNoktalari', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAtikNoktasiDto,
    @Req() req: Request,
  ): Promise<AdminAtikNoktasi> {
    const updated = await this.adminAtikNoktalariService.update(
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
  @RequirePermission('atikNoktalari', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminAtikNoktalariService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
