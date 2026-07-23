import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Appointment, AppointmentDocument } from './schemas/appointment.schema';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

export interface PublicAppointment {
  id: string;
  hizmetTuru: string;
  tarih: string;
  saat: string;
  durum: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<PublicAppointment> {
    const created = (await this.appointmentModel.create({
      hizmetTuru: dto.hizmetTuru,
      tarih: dto.tarih,
      saat: dto.saat,
      userId: dto.userId ?? null,
      durum: 'beklemede',
    })) as unknown as AppointmentDocument & {
      createdAt: Date;
      updatedAt: Date;
    };

    return {
      id: created._id.toString(),
      hizmetTuru: created.hizmetTuru,
      tarih: created.tarih.toISOString(),
      saat: created.saat,
      durum: created.durum,
      userId: created.userId ?? null,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }
}
