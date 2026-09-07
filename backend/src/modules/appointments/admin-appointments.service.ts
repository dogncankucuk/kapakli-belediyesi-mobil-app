import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';

export interface AdminAppointment {
  id: string;
  hizmetTuru: string;
  tarih: string;
  saat: string;
  durum: string;
  userId: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedAppointment = AppointmentDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminAppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<AdminAppointment[]> {
    const appointments = await this.appointmentModel.find().exec();
    return appointments.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedAppointment),
    );
  }

  async findOne(id: string): Promise<AdminAppointment | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.appointmentModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAppointment) : null;
  }

  async update(
    id: string,
    dto: UpdateAppointmentDto,
    updatedBy: string,
  ): Promise<AdminAppointment | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const oncekiDurum = (await this.appointmentModel.findById(id).exec())
      ?.durum;

    const doc = await this.appointmentModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    if (!doc) return null;

    if (doc.durum !== oncekiDurum && doc.userId) {
      const govde =
        doc.durum === 'onaylandi'
          ? 'Randevunuz onaylandı, detaylar için uygulamayı açın.'
          : 'Randevunuzun durumu güncellendi, detaylar için uygulamayı açın.';
      await this.notificationsService.sendToUser(
        doc.userId,
        'randevu',
        'Randevunuz güncellendi',
        govde,
      );
    }

    return this.toAdmin(doc as unknown as TimestampedAppointment);
  }

  private toAdmin(doc: TimestampedAppointment): AdminAppointment {
    return {
      id: doc._id.toString(),
      hizmetTuru: doc.hizmetTuru,
      tarih: doc.tarih.toISOString(),
      saat: doc.saat,
      durum: doc.durum,
      userId: doc.userId ?? null,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
