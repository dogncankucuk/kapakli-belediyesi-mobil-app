import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ElektrikKesintisi,
  ElektrikKesintisiDocument,
} from './schemas/elektrik-kesintisi.schema';

export interface PublicElektrikKesintisi {
  id: string;
  mahalle: string;
  tarih: string;
  aciklama: string;
}

@Injectable()
export class ElektrikKesintisiService {
  constructor(
    @InjectModel(ElektrikKesintisi.name)
    private readonly elektrikKesintisiModel: Model<ElektrikKesintisiDocument>,
  ) {}

  // Sadece bugun ve sonrasindaki elektrik kesintileri gosterilir.
  async findUpcoming(): Promise<PublicElektrikKesintisi[]> {
    const bugunBasi = new Date();
    bugunBasi.setHours(0, 0, 0, 0);

    const kesintiler = await this.elektrikKesintisiModel
      .find({ tarih: { $gte: bugunBasi } })
      .sort({ tarih: 1 })
      .exec();

    return kesintiler.map((doc) => ({
      id: doc._id.toString(),
      mahalle: doc.mahalle,
      tarih: doc.tarih.toISOString(),
      aciklama: doc.aciklama,
    }));
  }
}
