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
  AdminVefatIlani,
  AdminVefatEdenlerService,
} from './admin-vefat-edenler.service';
import { CreateVefatIlaniDto } from './dto/create-vefat-ilani.dto';
import { UpdateVefatIlaniDto } from './dto/update-vefat-ilani.dto';

@Controller('admin-api/vefat-edenler')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminVefatEdenlerController {
  constructor(
    private readonly adminVefatEdenlerService: AdminVefatEdenlerService,
  ) {}

  @Get()
  @RequirePermission('vefatEdenler', 'list')
  findAll(): Promise<AdminVefatIlani[]> {
    return this.adminVefatEdenlerService.findAll();
  }

  @Get(':id')
  @RequirePermission('vefatEdenler', 'show')
  async findOne(@Param('id') id: string): Promise<AdminVefatIlani> {
    const ilan = await this.adminVefatEdenlerService.findOne(id);
    if (!ilan) {
      throw new NotFoundException();
    }
    return ilan;
  }

  @Post()
  @RequirePermission('vefatEdenler', 'create')
  create(
    @Body() dto: CreateVefatIlaniDto,
    @Req() req: Request,
  ): Promise<AdminVefatIlani> {
    return this.adminVefatEdenlerService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('vefatEdenler', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVefatIlaniDto,
    @Req() req: Request,
  ): Promise<AdminVefatIlani> {
    const updated = await this.adminVefatEdenlerService.update(
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
  @RequirePermission('vefatEdenler', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminVefatEdenlerService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
