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

  // Henuz baslamamis ya da sureGun'e gore hala devam eden kazi calismalari gosterilir.
  async findUpcoming(): Promise<PublicKazi[]> {
    const bugunBasi = new Date();
    bugunBasi.setHours(0, 0, 0, 0);
    const MS_PER_GUN = 24 * 60 * 60 * 1000;

    const kazilar = await this.kaziModel
      .find({
        $expr: {
          $gte: [
            {
              $add: ['$baslangicTarihi', { $multiply: ['$sureGun', MS_PER_GUN] }],
            },
            bugunBasi,
          ],
        },
      })
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
