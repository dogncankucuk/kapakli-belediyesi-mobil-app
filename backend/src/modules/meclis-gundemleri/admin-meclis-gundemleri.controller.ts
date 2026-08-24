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
  AdminMeclisGundemi,
  AdminMeclisGundemleriService,
} from './admin-meclis-gundemleri.service';
import { CreateMeclisGundemiDto } from './dto/create-meclis-gundemi.dto';
import { UpdateMeclisGundemiDto } from './dto/update-meclis-gundemi.dto';

@Controller('admin-api/meclis-gundemleri')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminMeclisGundemleriController {
  constructor(
    private readonly adminMeclisGundemleriService: AdminMeclisGundemleriService,
  ) {}

  @Get()
  @RequirePermission('meclisGundemleri', 'list')
  findAll(): Promise<AdminMeclisGundemi[]> {
    return this.adminMeclisGundemleriService.findAll();
  }

  @Get(':id')
  @RequirePermission('meclisGundemleri', 'show')
  async findOne(@Param('id') id: string): Promise<AdminMeclisGundemi> {
    const gundem = await this.adminMeclisGundemleriService.findOne(id);
    if (!gundem) {
      throw new NotFoundException();
    }
    return gundem;
  }

  @Post()
  @RequirePermission('meclisGundemleri', 'create')
  create(
    @Body() dto: CreateMeclisGundemiDto,
    @Req() req: Request,
  ): Promise<AdminMeclisGundemi> {
    return this.adminMeclisGundemleriService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('meclisGundemleri', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMeclisGundemiDto,
    @Req() req: Request,
  ): Promise<AdminMeclisGundemi> {
    const updated = await this.adminMeclisGundemleriService.update(
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
  @RequirePermission('meclisGundemleri', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminMeclisGundemleriService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
