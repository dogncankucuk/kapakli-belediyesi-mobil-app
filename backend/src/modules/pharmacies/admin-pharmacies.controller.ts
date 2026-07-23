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
  AdminPharmacy,
  AdminPharmaciesService,
} from './admin-pharmacies.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';

@Controller('admin-api/pharmacies')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminPharmaciesController {
  constructor(
    private readonly adminPharmaciesService: AdminPharmaciesService,
  ) {}

  @Get()
  @RequirePermission('pharmacies', 'list')
  findAll(): Promise<AdminPharmacy[]> {
    return this.adminPharmaciesService.findAll();
  }

  @Get(':id')
  @RequirePermission('pharmacies', 'show')
  async findOne(@Param('id') id: string): Promise<AdminPharmacy> {
    const pharmacy = await this.adminPharmaciesService.findOne(id);
    if (!pharmacy) {
      throw new NotFoundException();
    }
    return pharmacy;
  }

  @Post()
  @RequirePermission('pharmacies', 'create')
  create(
    @Body() dto: CreatePharmacyDto,
    @Req() req: Request,
  ): Promise<AdminPharmacy> {
    return this.adminPharmaciesService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('pharmacies', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePharmacyDto,
    @Req() req: Request,
  ): Promise<AdminPharmacy> {
    const updated = await this.adminPharmaciesService.update(
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
  @RequirePermission('pharmacies', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminPharmaciesService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
