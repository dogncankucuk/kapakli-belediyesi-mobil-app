import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { KesintiApiAyarlariService } from '../kesinti-api-ayarlari/kesinti-api-ayarlari.service';
import { CreatePlanliKesintiDto } from './dto/create-planli-kesinti.dto';
import { UpdatePlanliKesintiDto } from './dto/update-planli-kesinti.dto';
import {
  PlanliKesinti,
  PlanliKesintiDocument,
} from './schemas/planli-kesinti.schema';

export interface AdminPlanliKesinti {
  id: string;
  tarih: string;
  ilce: string;
  aciklama: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KesintiApiSenkronizasyonSonucu {
  basarili: number;
  hatalar: string[];
}

type TimestampedPlanliKesinti = PlanliKesintiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminPlanliKesintilerService {
  private readonly logger = new Logger(AdminPlanliKesintilerService.name);

  constructor(
    @InjectModel(PlanliKesinti.name)
    private readonly planliKesintiModel: Model<PlanliKesintiDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly kesintiApiAyarlariService: KesintiApiAyarlariService,
  ) {}

  async findAll(): Promise<AdminPlanliKesinti[]> {
    const kesintiler = await this.planliKesintiModel
      .find()
      .sort({ tarih: -1 })
      .exec();
    return kesintiler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedPlanliKesinti),
    );
  }

  async findOne(id: string): Promise<AdminPlanliKesinti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.planliKesintiModel.findById(id).exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedPlanliKesinti)
      : null;
  }

  async create(
    dto: CreatePlanliKesintiDto,
    updatedBy: string,
  ): Promise<AdminPlanliKesinti> {
    const created = (await this.planliKesintiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedPlanliKesinti;

    void this.notificationsService
      .sendToMahalle(
        dto.ilce,
        'suKesintisi',
        'Planlı Su Kesintisi',
        'Bölgenizde planlı bir su kesintisi var, detaylar için uygulamayı açın.',
        'suKesintisi',
        created.id,
      )
      .catch((err) => this.logger.error('Broadcast basarisiz', err));

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdatePlanliKesintiDto,
    updatedBy: string,
  ): Promise<AdminPlanliKesinti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.planliKesintiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedPlanliKesinti)
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.planliKesintiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  // API henuz TESKI tarafindan saglanmadigi icin beklenen format kendi
  // CreatePlanliKesintiDto'muzla birebir ayni tutuldu: {ilce, tarih,
  // aciklama}[] JSON dizisi. Gercek API geldiginde format farkli cikarsa
  // bu metod (sadece alan eslemesi) guncellenir.
  async senkronizeApiIle(
    updatedBy: string,
  ): Promise<KesintiApiSenkronizasyonSonucu> {
    const apiUrl = await this.kesintiApiAyarlariService.getApiUrl('su');
    if (!apiUrl) {
      throw new BadRequestException(
        'Su kesintileri için API adresi henüz tanımlanmamış.',
      );
    }

    let veri: unknown;
    try {
      const yanit = await fetch(apiUrl);
      if (!yanit.ok) {
        throw new Error(`API ${yanit.status} döndü`);
      }
      veri = await yanit.json();
    } catch (err) {
      this.logger.error('Su kesintileri API senkronizasyonu başarısız', err as Error);
      throw new BadRequestException('API adresine ulaşılamadı');
    }

    if (!Array.isArray(veri)) {
      throw new BadRequestException('API beklenmeyen bir formatta yanıt döndü');
    }

    const hatalar: string[] = [];
    let basarili = 0;
    for (const [index, kayit] of veri.entries()) {
      const ilce = typeof kayit?.ilce === 'string' ? kayit.ilce.trim() : '';
      const tarih = typeof kayit?.tarih === 'string' ? kayit.tarih : '';
      const aciklama =
        typeof kayit?.aciklama === 'string' ? kayit.aciklama.trim() : '';
      if (!ilce || !tarih || !aciklama) {
        hatalar.push(`Kayıt ${index + 1}: eksik alan`);
        continue;
      }
      try {
        await this.create({ ilce, tarih, aciklama }, updatedBy);
        basarili++;
      } catch (err) {
        hatalar.push(
          `Kayıt ${index + 1}: ${err instanceof Error ? err.message : 'oluşturulamadı'}`,
        );
      }
    }

    return { basarili, hatalar };
  }

  private toAdmin(doc: TimestampedPlanliKesinti): AdminPlanliKesinti {
    return {
      id: doc._id.toString(),
      tarih: doc.tarih.toISOString(),
      ilce: doc.ilce,
      aciklama: doc.aciklama,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
