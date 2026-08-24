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
import { AdminRoleView, AdminRolesService } from './admin-roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('admin-api/roles')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminRolesController {
  constructor(private readonly adminRolesService: AdminRolesService) {}

  @Get()
  @RequirePermission('roles', 'list')
  findAll(): Promise<AdminRoleView[]> {
    return this.adminRolesService.findAll();
  }

  @Get(':id')
  @RequirePermission('roles', 'show')
  async findOne(@Param('id') id: string): Promise<AdminRoleView> {
    const role = await this.adminRolesService.findOne(id);
    if (!role) {
      throw new NotFoundException();
    }
    return role;
  }

  @Post()
  @RequirePermission('roles', 'create')
  create(
    @Body() dto: CreateRoleDto,
    @Req() req: Request,
  ): Promise<AdminRoleView> {
    return this.adminRolesService.create(dto, req.session.adminUser!.email);
  }

  @Patch(':id')
  @RequirePermission('roles', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Req() req: Request,
  ): Promise<AdminRoleView> {
    const updated = await this.adminRolesService.update(
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
  @RequirePermission('roles', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminRolesService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
