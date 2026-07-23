import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { VefatIlani, VefatIlaniDocument } from './schemas/vefat-ilani.schema';

export interface PublicVefatIlani {
  id: string;
  adSoyad: string;
  yas: number;
  not: string;
  mekan: string;
  namazVakti: string;
  tarih: string;
}

@Injectable()
export class VefatEdenlerService {
  constructor(
    @InjectModel(VefatIlani.name)
    private readonly vefatIlaniModel: Model<VefatIlaniDocument>,
  ) {}

  // Son 30 gunun ilanlarini dondurur; "bugun/gecmis" ayrimi mobil tarafta
  // tarih karsilastirmasiyla yapilir.
  async findRecent(): Promise<PublicVefatIlani[]> {
    const otuzGunOnce = new Date();
    otuzGunOnce.setDate(otuzGunOnce.getDate() - 30);

    const ilanlar = await this.vefatIlaniModel
      .find({ tarih: { $gte: otuzGunOnce } })
      .sort({ tarih: -1 })
      .exec();

    return ilanlar.map((doc) => ({
      id: doc._id.toString(),
      adSoyad: doc.adSoyad,
      yas: doc.yas,
      not: doc.not,
      mekan: doc.mekan,
      namazVakti: doc.namazVakti,
      tarih: doc.tarih.toISOString(),
    }));
  }
}
