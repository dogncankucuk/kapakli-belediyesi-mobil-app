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
  AdminOnemliKurum,
  AdminOnemliKurumlarService,
} from './admin-onemli-kurumlar.service';
import { CreateOnemliKurumDto } from './dto/create-onemli-kurum.dto';
import { UpdateOnemliKurumDto } from './dto/update-onemli-kurum.dto';

@Controller('admin-api/onemli-kurumlar')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminOnemliKurumlarController {
  constructor(
    private readonly adminOnemliKurumlarService: AdminOnemliKurumlarService,
  ) {}

  @Get()
  @RequirePermission('onemliKurumlar', 'list')
  findAll(): Promise<AdminOnemliKurum[]> {
    return this.adminOnemliKurumlarService.findAll();
  }

  @Get(':id')
  @RequirePermission('onemliKurumlar', 'show')
  async findOne(@Param('id') id: string): Promise<AdminOnemliKurum> {
    const kurum = await this.adminOnemliKurumlarService.findOne(id);
    if (!kurum) {
      throw new NotFoundException();
    }
    return kurum;
  }

  @Post()
  @RequirePermission('onemliKurumlar', 'create')
  create(
    @Body() dto: CreateOnemliKurumDto,
    @Req() req: Request,
  ): Promise<AdminOnemliKurum> {
    return this.adminOnemliKurumlarService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('onemliKurumlar', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOnemliKurumDto,
    @Req() req: Request,
  ): Promise<AdminOnemliKurum> {
    const updated = await this.adminOnemliKurumlarService.update(
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
  @RequirePermission('onemliKurumlar', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminOnemliKurumlarService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
