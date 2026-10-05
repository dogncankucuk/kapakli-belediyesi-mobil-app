import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Medya, MedyaDocument } from './schemas/medya.schema';
import {
  MedyaKlasoru,
  MedyaKlasoruDocument,
} from './schemas/medya-klasoru.schema';
import { CreateMedyaKlasoruDto } from './dto/create-medya-klasoru.dto';

export interface AdminMedyaKlasoru {
  id: string;
  ad: string;
  gorunurDepartmanlar: string[];
  dosyaSayisi: number;
  updatedBy: string | null;
  createdAt: string;
}

export interface KullaniciErisimi {
  departmanId: string | null;
  isFullAccess: boolean;
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

  // Bos gorunurDepartmanlar = herkese acik. Aksi halde sadece
  // erisim.departmanId listede varsa ya da erisim.isFullAccess (Super
  // Admin) ise gorunur. departmanId olmayan (departmansiz) bir kullanici,
  // kisitlanmis bir klasoru goremez.
  private gorebilirMi(
    gorunurDepartmanlar: string[],
    erisim: KullaniciErisimi,
  ): boolean {
    if (erisim.isFullAccess) return true;
    if (gorunurDepartmanlar.length === 0) return true;
    return erisim.departmanId !== null && gorunurDepartmanlar.includes(erisim.departmanId);
  }

  async findAll(erisim: KullaniciErisimi): Promise<AdminMedyaKlasoru[]> {
    const tumKlasorler = await this.klasorModel.find().sort({ ad: 1 }).exec();
    const klasorler = tumKlasorler.filter((doc) =>
      this.gorebilirMi(doc.gorunurDepartmanlar ?? [], erisim),
    );
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
        gorunurDepartmanlar: d.gorunurDepartmanlar ?? [],
        dosyaSayisi: sayimMap.get(d._id.toString()) ?? 0,
        updatedBy: d.updatedBy ?? null,
        createdAt: d.createdAt.toISOString(),
      };
    });
  }

  // AdminMedyaController'in dosya listeleme/yukleme sirasinda kullandigi
  // dogrudan erisim kontrolu - klasor listesinde gizli olsa bile id bilen
  // birinin dogrudan istekle icerigi gormesini engeller.
  async erisimVarMi(
    klasorId: string,
    erisim: KullaniciErisimi,
  ): Promise<boolean> {
    if (!Types.ObjectId.isValid(klasorId)) return false;
    const doc = await this.klasorModel.findById(klasorId).exec();
    if (!doc) return false;
    return this.gorebilirMi(doc.gorunurDepartmanlar ?? [], erisim);
  }

  async create(
    dto: CreateMedyaKlasoruDto,
    updatedBy: string,
  ): Promise<AdminMedyaKlasoru> {
    const temizAd = dto.ad.trim();
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
      gorunurDepartmanlar: dto.gorunurDepartmanlar ?? [],
      updatedBy,
    })) as unknown as TimestampedKlasor;
    return {
      id: created._id.toString(),
      ad: created.ad,
      gorunurDepartmanlar: created.gorunurDepartmanlar ?? [],
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
