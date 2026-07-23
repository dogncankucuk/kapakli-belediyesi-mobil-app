import { Body, Controller, Post } from '@nestjs/common';

import { AppointmentsService, PublicAppointment } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<PublicAppointment> {
    return this.appointmentsService.create(dto);
  }
}
