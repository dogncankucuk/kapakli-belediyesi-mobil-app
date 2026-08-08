import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AppointmentsService, PublicAppointment } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Throttle({ default: { limit: 10, ttl: 600_000 } })
  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<PublicAppointment> {
    return this.appointmentsService.create(dto);
  }
}
