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
  AdminAnnouncement,
  AdminAnnouncementsService,
} from './admin-announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Controller('admin-api/announcements')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminAnnouncementsController {
  constructor(
    private readonly adminAnnouncementsService: AdminAnnouncementsService,
  ) {}

  @Get()
  @RequirePermission('announcements', 'list')
  findAll(): Promise<AdminAnnouncement[]> {
    return this.adminAnnouncementsService.findAll();
  }

  @Get(':id')
  @RequirePermission('announcements', 'show')
  async findOne(@Param('id') id: string): Promise<AdminAnnouncement> {
    const announcement = await this.adminAnnouncementsService.findOne(id);
    if (!announcement) {
      throw new NotFoundException();
    }
    return announcement;
  }

  @Post()
  @RequirePermission('announcements', 'create')
  create(
    @Body() dto: CreateAnnouncementDto,
    @Req() req: Request,
  ): Promise<AdminAnnouncement> {
    return this.adminAnnouncementsService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('announcements', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
    @Req() req: Request,
  ): Promise<AdminAnnouncement> {
    const updated = await this.adminAnnouncementsService.update(
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
  @RequirePermission('announcements', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminAnnouncementsService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
