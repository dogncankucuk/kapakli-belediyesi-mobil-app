import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminPanelTemasi,
  AdminPanelTemasiService,
} from './admin-panel-temasi.service';
import { UpdatePanelTemasiDto } from './dto/update-panel-temasi.dto';

@Controller('admin-api/panel-temasi')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminPanelTemasiController {
  constructor(
    private readonly adminPanelTemasiService: AdminPanelTemasiService,
  ) {}

  @Get()
  @RequirePermission('panelTemasi', 'show')
  get(): Promise<AdminPanelTemasi> {
    return this.adminPanelTemasiService.get();
  }

  @Patch()
  @RequirePermission('panelTemasi', 'edit')
  update(
    @Body() dto: UpdatePanelTemasiDto,
    @Req() req: Request,
  ): Promise<AdminPanelTemasi> {
    return this.adminPanelTemasiService.update(
      dto,
      req.session.adminUser!.email,
    );
  }
}
