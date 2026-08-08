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
  AdminTarihiYer,
  AdminTarihiYerlerService,
} from './admin-tarihi-yerler.service';
import { CreateTarihiYerDto } from './dto/create-tarihi-yer.dto';
import { UpdateTarihiYerDto } from './dto/update-tarihi-yer.dto';

@Controller('admin-api/tarihi-yerler')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminTarihiYerlerController {
  constructor(
    private readonly adminTarihiYerlerService: AdminTarihiYerlerService,
  ) {}

  @Get()
  @RequirePermission('tarihiYerler', 'list')
  findAll(): Promise<AdminTarihiYer[]> {
    return this.adminTarihiYerlerService.findAll();
  }

  @Get(':id')
  @RequirePermission('tarihiYerler', 'show')
  async findOne(@Param('id') id: string): Promise<AdminTarihiYer> {
    const yer = await this.adminTarihiYerlerService.findOne(id);
    if (!yer) {
      throw new NotFoundException();
    }
    return yer;
  }

  @Post()
  @RequirePermission('tarihiYerler', 'create')
  create(
    @Body() dto: CreateTarihiYerDto,
    @Req() req: Request,
  ): Promise<AdminTarihiYer> {
    return this.adminTarihiYerlerService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('tarihiYerler', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTarihiYerDto,
    @Req() req: Request,
  ): Promise<AdminTarihiYer> {
    const updated = await this.adminTarihiYerlerService.update(
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
  @RequirePermission('tarihiYerler', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminTarihiYerlerService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
