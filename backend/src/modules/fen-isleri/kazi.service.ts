import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Kazi, KaziDocument } from './schemas/kazi.schema';

export interface PublicKazi {
  id: string;
  mahalle: string;
  baslangicTarihi: string;
  sureGun: number;
  saat: string;
  aciklama: string;
}

@Injectable()
export class KaziService {
  constructor(
    @InjectModel(Kazi.name)
    private readonly kaziModel: Model<KaziDocument>,
  ) {}

  // Sadece bugun ve sonrasinda baslayan kazi calismalari gosterilir.
  async findUpcoming(): Promise<PublicKazi[]> {
    const bugunBasi = new Date();
    bugunBasi.setHours(0, 0, 0, 0);

    const kazilar = await this.kaziModel
      .find({ baslangicTarihi: { $gte: bugunBasi } })
      .sort({ baslangicTarihi: 1 })
      .exec();

    return kazilar.map((doc) => ({
      id: doc._id.toString(),
      mahalle: doc.mahalle,
      baslangicTarihi: doc.baslangicTarihi.toISOString(),
      sureGun: doc.sureGun,
      saat: doc.saat,
      aciklama: doc.aciklama,
    }));
  }
}
