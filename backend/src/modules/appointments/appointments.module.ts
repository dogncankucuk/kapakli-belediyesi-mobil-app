import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { AdminAppointmentsService } from './admin-appointments.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  controllers: [AppointmentsController, AdminAppointmentsController],
  providers: [AppointmentsService, AdminAppointmentsService],
  exports: [MongooseModule],
})
export class AppointmentsModule {}
