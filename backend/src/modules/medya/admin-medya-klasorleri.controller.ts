import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import { PermissionsService } from '../roles/permissions.service';
import {
  AdminMedyaKlasoru,
  AdminMedyaKlasorleriService,
  KullaniciErisimi,
} from './admin-medya-klasorleri.service';
import { CreateMedyaKlasoruDto } from './dto/create-medya-klasoru.dto';

@Controller('admin-api/medya-klasorleri')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminMedyaKlasorleriController {
  constructor(
    private readonly adminMedyaKlasorleriService: AdminMedyaKlasorleriService,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async erisimBilgisi(req: Request): Promise<KullaniciErisimi> {
    const { roleId, departmanId } = req.session.adminUser!;
    const rol = await this.permissionsService.getRoleSummary(roleId);
    return { departmanId, isFullAccess: rol?.isFullAccess ?? false };
  }

  @Get()
  @RequirePermission('medya', 'list')
  async findAll(@Req() req: Request): Promise<AdminMedyaKlasoru[]> {
    return this.adminMedyaKlasorleriService.findAll(
      await this.erisimBilgisi(req),
    );
  }

  @Post()
  @RequirePermission('medyaKlasorleri', 'create')
  create(
    @Body() dto: CreateMedyaKlasoruDto,
    @Req() req: Request,
  ): Promise<AdminMedyaKlasoru> {
    return this.adminMedyaKlasorleriService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Delete(':id')
  @RequirePermission('medyaKlasorleri', 'delete')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: true }> {
    const erisim = await this.erisimBilgisi(req);
    if (!(await this.adminMedyaKlasorleriService.erisimVarMi(id, erisim))) {
      throw new ForbiddenException();
    }
    const removed = await this.adminMedyaKlasorleriService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
