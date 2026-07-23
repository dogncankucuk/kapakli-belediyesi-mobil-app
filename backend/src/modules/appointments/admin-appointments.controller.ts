import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminAppointment,
  AdminAppointmentsService,
} from './admin-appointments.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Controller('admin-api/appointments')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminAppointmentsController {
  constructor(
    private readonly adminAppointmentsService: AdminAppointmentsService,
  ) {}

  @Get()
  @RequirePermission('appointments', 'list')
  findAll(): Promise<AdminAppointment[]> {
    return this.adminAppointmentsService.findAll();
  }

  @Get(':id')
  @RequirePermission('appointments', 'show')
  async findOne(@Param('id') id: string): Promise<AdminAppointment> {
    const appointment = await this.adminAppointmentsService.findOne(id);
    if (!appointment) {
      throw new NotFoundException();
    }
    return appointment;
  }

  @Patch(':id')
  @RequirePermission('appointments', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
    @Req() req: Request,
  ): Promise<AdminAppointment> {
    const updated = await this.adminAppointmentsService.update(
      id,
      dto,
      req.session.adminUser!.email,
    );
    if (!updated) {
      throw new NotFoundException();
    }
    return updated;
  }
}
