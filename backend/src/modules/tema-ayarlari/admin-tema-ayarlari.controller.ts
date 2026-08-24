import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminTemaAyarlari,
  AdminTemaAyarlariService,
} from './admin-tema-ayarlari.service';
import { UpdateTemaAyarlariDto } from './dto/update-tema-ayarlari.dto';

@Controller('admin-api/tema-ayarlari')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminTemaAyarlariController {
  constructor(
    private readonly adminTemaAyarlariService: AdminTemaAyarlariService,
  ) {}

  @Get()
  @RequirePermission('temaAyarlari', 'show')
  get(): Promise<AdminTemaAyarlari> {
    return this.adminTemaAyarlariService.get();
  }

  @Patch()
  @RequirePermission('temaAyarlari', 'edit')
  update(
    @Body() dto: UpdateTemaAyarlariDto,
    @Req() req: Request,
  ): Promise<AdminTemaAyarlari> {
    return this.adminTemaAyarlariService.update(
      dto,
      req.session.adminUser!.email,
    );
  }
}
