import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import { AdminBaskan, AdminBaskanService } from './admin-baskan.service';
import { UpdateBaskanDto } from './dto/update-baskan.dto';

@Controller('admin-api/baskan')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminBaskanController {
  constructor(private readonly adminBaskanService: AdminBaskanService) {}

  @Get()
  @RequirePermission('baskan', 'show')
  get(): Promise<AdminBaskan> {
    return this.adminBaskanService.get();
  }

  @Patch()
  @RequirePermission('baskan', 'edit')
  update(
    @Body() dto: UpdateBaskanDto,
    @Req() req: Request,
  ): Promise<AdminBaskan> {
    return this.adminBaskanService.update(dto, req.session.adminUser!.email);
  }
}
