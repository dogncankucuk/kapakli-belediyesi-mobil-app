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
  AdminWifiNoktasi,
  AdminWifiNoktalariService,
} from './admin-wifi-noktalari.service';
import { CreateWifiNoktasiDto } from './dto/create-wifi-noktasi.dto';
import { UpdateWifiNoktasiDto } from './dto/update-wifi-noktasi.dto';

@Controller('admin-api/wifi-noktalari')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminWifiNoktalariController {
  constructor(
    private readonly adminWifiNoktalariService: AdminWifiNoktalariService,
  ) {}

  @Get()
  @RequirePermission('wifiNoktalari', 'list')
  findAll(): Promise<AdminWifiNoktasi[]> {
    return this.adminWifiNoktalariService.findAll();
  }

  @Get(':id')
  @RequirePermission('wifiNoktalari', 'show')
  async findOne(@Param('id') id: string): Promise<AdminWifiNoktasi> {
    const nokta = await this.adminWifiNoktalariService.findOne(id);
    if (!nokta) {
      throw new NotFoundException();
    }
    return nokta;
  }

  @Post()
  @RequirePermission('wifiNoktalari', 'create')
  create(
    @Body() dto: CreateWifiNoktasiDto,
    @Req() req: Request,
  ): Promise<AdminWifiNoktasi> {
    return this.adminWifiNoktalariService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('wifiNoktalari', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWifiNoktasiDto,
    @Req() req: Request,
  ): Promise<AdminWifiNoktasi> {
    const updated = await this.adminWifiNoktalariService.update(
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
  @RequirePermission('wifiNoktalari', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminWifiNoktalariService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
