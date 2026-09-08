import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import { OptionalJwtAuthGuard } from '../users/optional-jwt-auth.guard';
import { UsersModule } from '../users/users.module';
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
    // UsersModule zaten User modelini export ediyor - OptionalJwtAuthGuard'in
    // ihtiyac duydugu JwtService burada da users.module.ts ile ayni sekilde
    // saglaniyor (bkz. notifications.module.ts'teki ayni desen).
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppointmentsController, AdminAppointmentsController],
  providers: [
    AppointmentsService,
    AdminAppointmentsService,
    AppointmentRemindersService,
    OptionalJwtAuthGuard,
  ],
  exports: [MongooseModule],
})
export class AppointmentsModule {}
