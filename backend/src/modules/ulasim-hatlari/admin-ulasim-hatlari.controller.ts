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
  AdminUlasimHatti,
  AdminUlasimHatlariService,
} from './admin-ulasim-hatlari.service';
import { CreateUlasimHattiDto } from './dto/create-ulasim-hatti.dto';
import { UpdateUlasimHattiDto } from './dto/update-ulasim-hatti.dto';

@Controller('admin-api/ulasim-hatlari')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminUlasimHatlariController {
  constructor(
    private readonly adminUlasimHatlariService: AdminUlasimHatlariService,
  ) {}

  @Get()
  @RequirePermission('ulasimHatlari', 'list')
  findAll(): Promise<AdminUlasimHatti[]> {
    return this.adminUlasimHatlariService.findAll();
  }

  @Get(':id')
  @RequirePermission('ulasimHatlari', 'show')
  async findOne(@Param('id') id: string): Promise<AdminUlasimHatti> {
    const hat = await this.adminUlasimHatlariService.findOne(id);
    if (!hat) {
      throw new NotFoundException();
    }
    return hat;
  }

  @Post()
  @RequirePermission('ulasimHatlari', 'create')
  create(
    @Body() dto: CreateUlasimHattiDto,
    @Req() req: Request,
  ): Promise<AdminUlasimHatti> {
    return this.adminUlasimHatlariService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('ulasimHatlari', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUlasimHattiDto,
    @Req() req: Request,
  ): Promise<AdminUlasimHatti> {
    const updated = await this.adminUlasimHatlariService.update(
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
  @RequirePermission('ulasimHatlari', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminUlasimHatlariService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
