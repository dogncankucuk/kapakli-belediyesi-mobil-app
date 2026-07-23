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
  AdminPlanliKesinti,
  AdminPlanliKesintilerService,
} from './admin-planli-kesintiler.service';
import { CreatePlanliKesintiDto } from './dto/create-planli-kesinti.dto';
import { UpdatePlanliKesintiDto } from './dto/update-planli-kesinti.dto';

@Controller('admin-api/planli-kesintiler')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminPlanliKesintilerController {
  constructor(
    private readonly adminPlanliKesintilerService: AdminPlanliKesintilerService,
  ) {}

  @Get()
  @RequirePermission('suHizmetleri', 'list')
  findAll(): Promise<AdminPlanliKesinti[]> {
    return this.adminPlanliKesintilerService.findAll();
  }

  @Get(':id')
  @RequirePermission('suHizmetleri', 'show')
  async findOne(@Param('id') id: string): Promise<AdminPlanliKesinti> {
    const kesinti = await this.adminPlanliKesintilerService.findOne(id);
    if (!kesinti) {
      throw new NotFoundException();
    }
    return kesinti;
  }

  @Post()
  @RequirePermission('suHizmetleri', 'create')
  create(
    @Body() dto: CreatePlanliKesintiDto,
    @Req() req: Request,
  ): Promise<AdminPlanliKesinti> {
    return this.adminPlanliKesintilerService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('suHizmetleri', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePlanliKesintiDto,
    @Req() req: Request,
  ): Promise<AdminPlanliKesinti> {
    const updated = await this.adminPlanliKesintilerService.update(
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
  @RequirePermission('suHizmetleri', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminPlanliKesintilerService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
