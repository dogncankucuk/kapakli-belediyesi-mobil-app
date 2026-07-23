import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  GununMenusu,
  GununMenusuDocument,
} from './schemas/gunun-menusu.schema';

export interface PublicGununMenusu {
  id: string;
  tarih: string;
  kalemler: { ad: string; aciklama: string }[];
  fiyat: number;
}

@Injectable()
export class KentLokantasiService {
  constructor(
    @InjectModel(GununMenusu.name)
    private readonly gununMenusuModel: Model<GununMenusuDocument>,
  ) {}

  // En son eklenen (bugune en yakin) menuyu dondurur.
  async findLatest(): Promise<PublicGununMenusu | null> {
    const doc = await this.gununMenusuModel
      .findOne()
      .sort({ tarih: -1 })
      .exec();
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      tarih: doc.tarih.toISOString(),
      kalemler: doc.kalemler.map((k) => ({ ad: k.ad, aciklama: k.aciklama })),
      fiyat: doc.fiyat,
    };
  }
}
