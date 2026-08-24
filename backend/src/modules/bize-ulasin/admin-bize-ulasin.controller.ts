import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminBizeUlasin,
  AdminBizeUlasinService,
} from './admin-bize-ulasin.service';
import { UpdateBizeUlasinDto } from './dto/update-bize-ulasin.dto';

@Controller('admin-api/bize-ulasin')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminBizeUlasinController {
  constructor(
    private readonly adminBizeUlasinService: AdminBizeUlasinService,
  ) {}

  @Get()
  @RequirePermission('bizeUlasin', 'show')
  get(): Promise<AdminBizeUlasin> {
    return this.adminBizeUlasinService.get();
  }

  @Patch()
  @RequirePermission('bizeUlasin', 'edit')
  update(
    @Body() dto: UpdateBizeUlasinDto,
    @Req() req: Request,
  ): Promise<AdminBizeUlasin> {
    return this.adminBizeUlasinService.update(
      dto,
      req.session.adminUser!.email,
    );
  }
}
