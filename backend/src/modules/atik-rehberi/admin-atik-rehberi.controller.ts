import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminAtikRehberiIcerik,
  AdminAtikRehberiService,
} from './admin-atik-rehberi.service';
import { UpdateAtikRehberiIcerikDto } from './dto/update-atik-rehberi-icerik.dto';

@Controller('admin-api/atik-rehberi')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminAtikRehberiController {
  constructor(
    private readonly adminAtikRehberiService: AdminAtikRehberiService,
  ) {}

  @Get()
  @RequirePermission('atikRehberi', 'show')
  findAll(): Promise<AdminAtikRehberiIcerik[]> {
    return this.adminAtikRehberiService.findAll();
  }

  @Patch()
  @RequirePermission('atikRehberi', 'edit')
  update(
    @Body() dto: UpdateAtikRehberiIcerikDto,
    @Req() req: Request,
  ): Promise<AdminAtikRehberiIcerik> {
    return this.adminAtikRehberiService.update(
      dto,
      req.session.adminUser!.email,
    );
  }
}
