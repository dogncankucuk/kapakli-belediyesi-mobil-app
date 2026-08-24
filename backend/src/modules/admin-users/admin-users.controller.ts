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
import { AdminUsersService, AdminUserView } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Controller('admin-api/admin-users')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @RequirePermission('adminUsers', 'list')
  findAll(): Promise<AdminUserView[]> {
    return this.adminUsersService.findAll();
  }

  @Get(':id')
  @RequirePermission('adminUsers', 'show')
  async findOne(@Param('id') id: string): Promise<AdminUserView> {
    const user = await this.adminUsersService.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  @Post()
  @RequirePermission('adminUsers', 'create')
  create(
    @Body() dto: CreateAdminUserDto,
    @Req() req: Request,
  ): Promise<AdminUserView> {
    return this.adminUsersService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('adminUsers', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @Req() req: Request,
  ): Promise<AdminUserView> {
    const updated = await this.adminUsersService.update(
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
  @RequirePermission('adminUsers', 'delete')
  async remove(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: true }> {
    const removed = await this.adminUsersService.remove(
      id,
      req.session.adminUser!.email,
    );
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
