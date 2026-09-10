import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Medya, MedyaDocument } from './schemas/medya.schema';
import {
  MedyaKlasoru,
  MedyaKlasoruDocument,
} from './schemas/medya-klasoru.schema';

export interface AdminMedyaKlasoru {
  id: string;
  ad: string;
  dosyaSayisi: number;
  updatedBy: string | null;
  createdAt: string;
}

type TimestampedKlasor = MedyaKlasoruDocument & { createdAt: Date };

@Injectable()
export class AdminMedyaKlasorleriService {
  constructor(
    @InjectModel(MedyaKlasoru.name)
    private readonly klasorModel: Model<MedyaKlasoruDocument>,
    @InjectModel(Medya.name)
    private readonly medyaModel: Model<MedyaDocument>,
  ) {}

  async findAll(): Promise<AdminMedyaKlasoru[]> {
    const klasorler = await this.klasorModel.find().sort({ ad: 1 }).exec();
    const sayimlar = await this.medyaModel.aggregate<{
      _id: string;
      adet: number;
    }>([{ $group: { _id: '$klasorId', adet: { $sum: 1 } } }]);
    const sayimMap = new Map(sayimlar.map((s) => [s._id, s.adet]));

    return klasorler.map((doc) => {
      const d = doc as unknown as TimestampedKlasor;
      return {
        id: d._id.toString(),
        ad: d.ad,
        dosyaSayisi: sayimMap.get(d._id.toString()) ?? 0,
        updatedBy: d.updatedBy ?? null,
        createdAt: d.createdAt.toISOString(),
      };
    });
  }

  async create(ad: string, updatedBy: string): Promise<AdminMedyaKlasoru> {
    const temizAd = ad.trim();
    if (!temizAd) {
      throw new BadRequestException('Klasör adı gerekli');
    }
    const mevcut = await this.klasorModel
      .exists({ ad: { $regex: `^${escapeRegex(temizAd)}$`, $options: 'i' } })
      .exec();
    if (mevcut) {
      throw new BadRequestException('Bu isimde bir klasör zaten var');
    }
    const created = (await this.klasorModel.create({
      ad: temizAd,
      updatedBy,
    })) as unknown as TimestampedKlasor;
    return {
      id: created._id.toString(),
      ad: created.ad,
      dosyaSayisi: 0,
      updatedBy: created.updatedBy ?? null,
      createdAt: created.createdAt.toISOString(),
    };
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const iceridekiDosyaSayisi = await this.medyaModel
      .countDocuments({ klasorId: id })
      .exec();
    if (iceridekiDosyaSayisi > 0) {
      throw new BadRequestException(
        'Bu klasörde dosyalar var - önce dosyaları taşıyın veya silin',
      );
    }
    const res = await this.klasorModel.findByIdAndDelete(id).exec();
    return !!res;
  }
}

function escapeRegex(metin: string): string {
  return metin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
