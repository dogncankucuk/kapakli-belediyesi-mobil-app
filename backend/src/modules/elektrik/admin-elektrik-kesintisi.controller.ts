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
  AdminElektrikKesintisi,
  AdminElektrikKesintisiService,
} from './admin-elektrik-kesintisi.service';
import { CreateElektrikKesintisiDto } from './dto/create-elektrik-kesintisi.dto';
import { UpdateElektrikKesintisiDto } from './dto/update-elektrik-kesintisi.dto';

@Controller('admin-api/elektrik-kesintileri')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminElektrikKesintisiController {
  constructor(
    private readonly adminElektrikKesintisiService: AdminElektrikKesintisiService,
  ) {}

  @Get()
  @RequirePermission('elektrikKesintileri', 'list')
  findAll(): Promise<AdminElektrikKesintisi[]> {
    return this.adminElektrikKesintisiService.findAll();
  }

  @Get(':id')
  @RequirePermission('elektrikKesintileri', 'show')
  async findOne(@Param('id') id: string): Promise<AdminElektrikKesintisi> {
    const kesinti = await this.adminElektrikKesintisiService.findOne(id);
    if (!kesinti) {
      throw new NotFoundException();
    }
    return kesinti;
  }

  @Post()
  @RequirePermission('elektrikKesintileri', 'create')
  create(
    @Body() dto: CreateElektrikKesintisiDto,
    @Req() req: Request,
  ): Promise<AdminElektrikKesintisi> {
    return this.adminElektrikKesintisiService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('elektrikKesintileri', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateElektrikKesintisiDto,
    @Req() req: Request,
  ): Promise<AdminElektrikKesintisi> {
    const updated = await this.adminElektrikKesintisiService.update(
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
  @RequirePermission('elektrikKesintileri', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminElektrikKesintisiService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
