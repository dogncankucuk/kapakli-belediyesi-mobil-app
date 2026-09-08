import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { OptionalJwtAuthGuard } from '../users/optional-jwt-auth.guard';
import type { OptionalAuthenticatedRequest } from '../users/optional-jwt-auth.guard';
import { AppointmentsService, PublicAppointment } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  create(
    @Body() dto: CreateAppointmentDto,
    @Req() request: OptionalAuthenticatedRequest,
  ): Promise<PublicAppointment> {
    return this.appointmentsService.create(dto, request.userId);
  }
}
