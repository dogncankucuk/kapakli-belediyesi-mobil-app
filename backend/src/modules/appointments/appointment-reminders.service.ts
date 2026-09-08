import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { Appointment, AppointmentDocument } from './schemas/appointment.schema';

const ISTANBUL_UTC_OFFSET_SAAT = 3; // Europe/Istanbul 2016'dan beri yaz saati uygulamiyor, sabit UTC+3.
const YIRMI_DORT_SAAT_MS = 24 * 60 * 60 * 1000;
// "iptal"/"reddedildi" gibi bir son-durum kavraminin appointments'ta sabit
// bir enum'u yok (durum admin panelde serbest metin, bkz. AppointmentsPage.tsx) -
// bu yuzden bilinen aktif durumlari allowlist'e aliyoruz, olceksiz bir
// durum degeri (iptal vb.) otomatik olarak disarida kaliyor.
const HATIRLATMA_GONDERILECEK_DURUMLAR = ['beklemede', 'onaylandi'];

// Mobilde su an randevu olusturma akisi canli degil, bu cron ileride akis
// acilinca devreye girecek - bu normal, hata degil.
@Injectable()
export class AppointmentRemindersService {
  private readonly logger = new Logger(AppointmentRemindersService.name);

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

  // Randevu Istanbul takviminde bugun mu yarin mi diye bakar (saat farkina
  // degil, takvim gunune gore) - "yarin" metninin bugunku randevuda da
  // yanlislikla gosterilmesini onlemek icin.
  private istanbulGunFarki(simdi: Date, randevuZamani: Date): number {
    const ofsetMs = ISTANBUL_UTC_OFFSET_SAAT * 60 * 60 * 1000;
    const gunBasi = (tarih: Date) => {
      const istanbul = new Date(tarih.getTime() + ofsetMs);
      return Date.UTC(
        istanbul.getUTCFullYear(),
        istanbul.getUTCMonth(),
        istanbul.getUTCDate(),
      );
    };
    return Math.round(
      (gunBasi(randevuZamani) - gunBasi(simdi)) / YIRMI_DORT_SAAT_MS,
    );
  }

  @Cron(CronExpression.EVERY_HOUR)
  async hatirlatmalariGonder(): Promise<void> {
    const simdi = new Date();
    const adaylar = await this.appointmentModel
      .find({
        hatirlatmaGonderildiMi: { $ne: true },
        durum: { $in: HATIRLATMA_GONDERILECEK_DURUMLAR },
        tarih: {
          $gte: new Date(simdi.getTime() - YIRMI_DORT_SAAT_MS),
          $lte: new Date(simdi.getTime() + YIRMI_DORT_SAAT_MS),
        },
      })
      .exec();

    for (const doc of adaylar) {
      try {
        if (!doc.userId) continue;

        const randevuZamani = this.randevuUtcZamani(doc);
        const kalanMs = randevuZamani.getTime() - simdi.getTime();
        if (kalanMs < 0 || kalanMs > YIRMI_DORT_SAAT_MS) continue;

        const bugunMu = this.istanbulGunFarki(simdi, randevuZamani) <= 0;
        const gunIfadesi = bugunMu ? 'Bugün' : 'Yarın';

        await this.notificationsService.sendToUser(
          doc.userId,
          'randevu',
          'Randevu Hatırlatma',
          `${gunIfadesi} saat ${doc.saat}'te randevunuz var.`,
        );
        doc.hatirlatmaGonderildiMi = true;
        await doc.save();
      } catch (err) {
        this.logger.error(
          `Randevu hatirlatmasi gonderilemedi (id=${doc._id.toString()})`,
          err as Error,
        );
      }
    }
  }
}
