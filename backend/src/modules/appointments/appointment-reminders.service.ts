import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';

const ISTANBUL_UTC_OFFSET_SAAT = 3; // Europe/Istanbul 2016'dan beri yaz saati uygulamiyor, sabit UTC+3.
const YIRMI_DORT_SAAT_MS = 24 * 60 * 60 * 1000;

// Mobilde su an randevu olusturma akisi canli degil, bu cron ileride akis
// acilinca devreye girecek - bu normal, hata degil.
@Injectable()
export class AppointmentRemindersService {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private randevuUtcZamani(doc: AppointmentDocument): Date {
    const [saat, dakika] = doc.saat.split(':').map(Number);
    return new Date(
      Date.UTC(
        doc.tarih.getUTCFullYear(),
        doc.tarih.getUTCMonth(),
        doc.tarih.getUTCDate(),
        saat - ISTANBUL_UTC_OFFSET_SAAT,
        dakika,
      ),
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async hatirlatmalariGonder(): Promise<void> {
    const simdi = new Date();
    const adaylar = await this.appointmentModel
      .find({
        hatirlatmaGonderildiMi: { $ne: true },
        tarih: {
          $gte: new Date(simdi.getTime() - YIRMI_DORT_SAAT_MS),
          $lte: new Date(simdi.getTime() + YIRMI_DORT_SAAT_MS),
        },
      })
      .exec();

    for (const doc of adaylar) {
      if (!doc.userId) continue;

      const randevuZamani = this.randevuUtcZamani(doc);
      const kalanMs = randevuZamani.getTime() - simdi.getTime();
      if (kalanMs < 0 || kalanMs > YIRMI_DORT_SAAT_MS) continue;

      await this.notificationsService.sendToUser(
        doc.userId,
        'randevu',
        'Randevu Hatırlatma',
        `Yarın saat ${doc.saat}'te randevunuz var.`,
      );
      doc.hatirlatmaGonderildiMi = true;
      await doc.save();
    }
  }
}
