import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { KesintiApiAyarlariService } from '../kesinti-api-ayarlari/kesinti-api-ayarlari.service';
import { CreateElektrikKesintisiDto } from './dto/create-elektrik-kesintisi.dto';
import { UpdateElektrikKesintisiDto } from './dto/update-elektrik-kesintisi.dto';
import {
  ElektrikKesintisi,
  ElektrikKesintisiDocument,
} from './schemas/elektrik-kesintisi.schema';

export interface AdminElektrikKesintisi {
  id: string;
  mahalle: string;
  tarih: string;
  aciklama: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface KesintiApiSenkronizasyonSonucu {
  basarili: number;
  hatalar: string[];
}

type TimestampedElektrikKesintisi = ElektrikKesintisiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminElektrikKesintisiService {
  private readonly logger = new Logger(AdminElektrikKesintisiService.name);

  constructor(
    @InjectModel(ElektrikKesintisi.name)
    private readonly elektrikKesintisiModel: Model<ElektrikKesintisiDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly kesintiApiAyarlariService: KesintiApiAyarlariService,
  ) {}

  async findAll(): Promise<AdminElektrikKesintisi[]> {
    const kesintiler = await this.elektrikKesintisiModel
      .find()
      .sort({ tarih: -1 })
      .exec();
    return kesintiler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedElektrikKesintisi),
    );
  }

  async findOne(id: string): Promise<AdminElektrikKesintisi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.elektrikKesintisiModel.findById(id).exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedElektrikKesintisi)
      : null;
  }

  async create(
    dto: CreateElektrikKesintisiDto,
    updatedBy: string,
  ): Promise<AdminElektrikKesintisi> {
    const created = (await this.elektrikKesintisiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedElektrikKesintisi;

    void this.notificationsService
      .sendToMahalle(
        dto.mahalle,
        'elektrikKesintisi',
        'Planlı Elektrik Kesintisi',
        'Bölgenizde planlı bir elektrik kesintisi var, detaylar için uygulamayı açın.',
        'elektrikKesintisi',
        created.id,
      )
      .catch((err) => this.logger.error('Broadcast basarisiz', err));

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateElektrikKesintisiDto,
    updatedBy: string,
  ): Promise<AdminElektrikKesintisi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.elektrikKesintisiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedElektrikKesintisi)
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.elektrikKesintisiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  // API henuz TREDAS tarafindan saglanmadigi icin beklenen format kendi
  // CreateElektrikKesintisiDto'muzla birebir ayni tutuldu: {mahalle, tarih,
  // aciklama}[] JSON dizisi. Gercek API geldiginde format farkli cikarsa
  // bu metod (sadece alan eslemesi) guncellenir.
  async senkronizeApiIle(
    updatedBy: string,
  ): Promise<KesintiApiSenkronizasyonSonucu> {
    const apiUrl = await this.kesintiApiAyarlariService.getApiUrl('elektrik');
    if (!apiUrl) {
      throw new BadRequestException(
        'Elektrik kesintileri için API adresi henüz tanımlanmamış.',
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
      this.logger.error(
        'Elektrik kesintileri API senkronizasyonu başarısız',
        err as Error,
      );
      throw new BadRequestException('API adresine ulaşılamadı');
    }

    if (!Array.isArray(veri)) {
      throw new BadRequestException('API beklenmeyen bir formatta yanıt döndü');
    }

    const hatalar: string[] = [];
    let basarili = 0;
    for (const [index, kayit] of veri.entries()) {
      const mahalle =
        typeof kayit?.mahalle === 'string' ? kayit.mahalle.trim() : '';
      const tarih = typeof kayit?.tarih === 'string' ? kayit.tarih : '';
      const aciklama =
        typeof kayit?.aciklama === 'string' ? kayit.aciklama.trim() : '';
      if (!mahalle || !tarih || !aciklama) {
        hatalar.push(`Kayıt ${index + 1}: eksik alan`);
        continue;
      }
      try {
        await this.create({ mahalle, tarih, aciklama }, updatedBy);
        basarili++;
      } catch (err) {
        hatalar.push(
          `Kayıt ${index + 1}: ${err instanceof Error ? err.message : 'oluşturulamadı'}`,
        );
      }
    }

    return { basarili, hatalar };
  }

  private toAdmin(
    doc: TimestampedElektrikKesintisi,
  ): AdminElektrikKesintisi {
    return {
      id: doc._id.toString(),
      mahalle: doc.mahalle,
      tarih: doc.tarih.toISOString(),
      aciklama: doc.aciklama,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
