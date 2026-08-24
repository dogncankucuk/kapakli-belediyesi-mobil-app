import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminHakkimizda,
  AdminHakkimizdaService,
} from './admin-hakkimizda.service';
import { UpdateHakkimizdaDto } from './dto/update-hakkimizda.dto';

@Controller('admin-api/hakkimizda')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminHakkimizdaController {
  constructor(
    private readonly adminHakkimizdaService: AdminHakkimizdaService,
  ) {}

  @Get()
  @RequirePermission('hakkimizda', 'show')
  get(): Promise<AdminHakkimizda> {
    return this.adminHakkimizdaService.get();
  }

  @Patch()
  @RequirePermission('hakkimizda', 'edit')
  update(
    @Body() dto: UpdateHakkimizdaDto,
    @Req() req: Request,
  ): Promise<AdminHakkimizda> {
    return this.adminHakkimizdaService.update(
      dto,
      req.session.adminUser!.email,
    );
  }
}
