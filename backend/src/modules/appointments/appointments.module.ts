import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { Appointment, AppointmentSchema } from './schemas/appointment.schema';
import { AdminAppointmentsController } from './admin-appointments.controller';
import { AdminAppointmentsService } from './admin-appointments.service';
import { AppointmentRemindersService } from './appointment-reminders.service';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [AppointmentsController, AdminAppointmentsController],
  providers: [
    AppointmentsService,
    AdminAppointmentsService,
    AppointmentRemindersService,
  ],
  exports: [MongooseModule],
})
export class AppointmentsModule {}
