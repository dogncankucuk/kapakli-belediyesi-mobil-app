import {
  Body,
  Controller,
  Delete,
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
import {
  AdminMedyaKlasoru,
  AdminMedyaKlasorleriService,
} from './admin-medya-klasorleri.service';

@Controller('admin-api/medya-klasorleri')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminMedyaKlasorleriController {
  constructor(
    private readonly adminMedyaKlasorleriService: AdminMedyaKlasorleriService,
  ) {}

  @Get()
  @RequirePermission('medya', 'list')
  findAll(): Promise<AdminMedyaKlasoru[]> {
    return this.adminMedyaKlasorleriService.findAll();
  }

  @Post()
  @RequirePermission('medya', 'create')
  create(
    @Body('ad') ad: string,
    @Req() req: Request,
  ): Promise<AdminMedyaKlasoru> {
    return this.adminMedyaKlasorleriService.create(
      ad,
      req.session.adminUser!.email,
    );
  }

  @Delete(':id')
  @RequirePermission('medya', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminMedyaKlasorleriService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
