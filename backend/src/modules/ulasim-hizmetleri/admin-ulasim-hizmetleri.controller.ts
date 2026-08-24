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
  AdminUlasimSecenegi,
  AdminUlasimHizmetleriService,
} from './admin-ulasim-hizmetleri.service';
import { CreateUlasimSecenegiDto } from './dto/create-ulasim-secenegi.dto';
import { UpdateUlasimSecenegiDto } from './dto/update-ulasim-secenegi.dto';

@Controller('admin-api/ulasim-hizmetleri')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminUlasimHizmetleriController {
  constructor(
    private readonly adminUlasimHizmetleriService: AdminUlasimHizmetleriService,
  ) {}

  @Get()
  @RequirePermission('ulasimHizmetleri', 'list')
  findAll(): Promise<AdminUlasimSecenegi[]> {
    return this.adminUlasimHizmetleriService.findAll();
  }

  @Get(':id')
  @RequirePermission('ulasimHizmetleri', 'show')
  async findOne(@Param('id') id: string): Promise<AdminUlasimSecenegi> {
    const secenek = await this.adminUlasimHizmetleriService.findOne(id);
    if (!secenek) {
      throw new NotFoundException();
    }
    return secenek;
  }

  @Post()
  @RequirePermission('ulasimHizmetleri', 'create')
  create(
    @Body() dto: CreateUlasimSecenegiDto,
    @Req() req: Request,
  ): Promise<AdminUlasimSecenegi> {
    return this.adminUlasimHizmetleriService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('ulasimHizmetleri', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUlasimSecenegiDto,
    @Req() req: Request,
  ): Promise<AdminUlasimSecenegi> {
    const updated = await this.adminUlasimHizmetleriService.update(
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
  @RequirePermission('ulasimHizmetleri', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminUlasimHizmetleriService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
