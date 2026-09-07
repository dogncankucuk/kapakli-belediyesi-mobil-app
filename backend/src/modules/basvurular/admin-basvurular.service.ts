import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { unlink } from 'fs/promises';
import { Model, Types } from 'mongoose';
import { join } from 'path';

import { UPLOADS_DIR } from '../../uploads-dir';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateBasvuruDto } from './dto/update-basvuru.dto';
import {
  Basvuru,
  BasvuruBelgesi,
  BasvuruDocument,
  BasvuruDurumu,
  EkBilgiDegeri,
} from './schemas/basvuru.schema';

export interface AdminBasvuru {
  id: string;
  basvuruTuruId: string;
  basvuruTuruAdi: string;
  adSoyad: string;
  kimlikNo: string;
  dogumTarihi: string;
  adres: string;
  ekBilgiler: EkBilgiDegeri[];
  belgeler: BasvuruBelgesi[];
  durum: BasvuruDurumu;
  redSebebi: string | null;
  adminNotu: string | null;
  kullaniciNotu: string | null;
  userId: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedBasvuru = BasvuruDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminBasvurularService {
  constructor(
    @InjectModel(Basvuru.name)
    private readonly basvuruModel: Model<BasvuruDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<AdminBasvuru[]> {
    const basvurular = await this.basvuruModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
    return basvurular.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedBasvuru),
    );
  }

  async findOne(id: string): Promise<AdminBasvuru | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.basvuruModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedBasvuru) : null;
  }

  async update(
    id: string,
    dto: UpdateBasvuruDto,
    updatedBy: string,
  ): Promise<AdminBasvuru | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const oncekiDurum = (await this.basvuruModel.findById(id).exec())?.durum;

    const updatePayload: Record<string, unknown> = { updatedBy };

    if (dto.durum !== undefined) {
      if (dto.durum === 'reddedildi' && !dto.redSebebi?.trim()) {
        throw new BadRequestException(
          'Reddedilen basvurular icin red sebebi zorunludur',
        );
      }
      updatePayload.durum = dto.durum;
      updatePayload.redSebebi =
        dto.durum === 'reddedildi' ? dto.redSebebi!.trim() : null;
    }
    if (dto.adminNotu !== undefined) {
      updatePayload.adminNotu = dto.adminNotu.trim() || null;
    }
    if (dto.kullaniciNotu !== undefined) {
      updatePayload.kullaniciNotu = dto.kullaniciNotu.trim() || null;
    }

    const doc = await this.basvuruModel
      .findByIdAndUpdate(id, updatePayload, { new: true })
      .exec();
    if (!doc) return null;

    if (doc.durum !== oncekiDurum && doc.userId) {
      await this.notificationsService.sendToUser(
        doc.userId,
        'basvuruDurumu',
        'Başvurunuz güncellendi',
        'Başvurunuzun durumu güncellendi, detaylar için uygulamayı açın.',
      );
    }

    return this.toAdmin(doc as unknown as TimestampedBasvuru);
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const doc = await this.basvuruModel.findByIdAndDelete(id).exec();
    if (!doc) return false;
    for (const belge of doc.belgeler ?? []) {
      const dosyaAdi = belge.url.replace('/uploads/', '');
      await unlink(join(UPLOADS_DIR, dosyaAdi)).catch(() => {});
    }
    return true;
  }

  private toAdmin(doc: TimestampedBasvuru): AdminBasvuru {
    return {
      id: doc._id.toString(),
      basvuruTuruId: doc.basvuruTuruId,
      basvuruTuruAdi: doc.basvuruTuruAdi,
      adSoyad: doc.adSoyad,
      kimlikNo: doc.kimlikNo,
      dogumTarihi: doc.dogumTarihi,
      adres: doc.adres,
      ekBilgiler: doc.ekBilgiler ?? [],
      belgeler: doc.belgeler ?? [],
      durum: doc.durum,
      redSebebi: doc.redSebebi ?? null,
      adminNotu: doc.adminNotu ?? null,
      kullaniciNotu: doc.kullaniciNotu ?? null,
      userId: doc.userId ?? null,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
