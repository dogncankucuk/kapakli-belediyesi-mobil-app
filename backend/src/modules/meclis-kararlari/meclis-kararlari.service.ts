import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  MeclisKarari,
  MeclisKarariDocument,
} from './schemas/meclis-karari.schema';

export interface PublicMeclisKarari {
  id: string;
  kararNo: string;
  kategori: string;
  tarih: string;
  baslik: string;
}

@Injectable()
export class MeclisKararlariService {
  constructor(
    @InjectModel(MeclisKarari.name)
    private readonly meclisKarariModel: Model<MeclisKarariDocument>,
  ) {}

  async findAll(): Promise<PublicMeclisKarari[]> {
    const kararlar = await this.meclisKarariModel
      .find()
      .sort({ tarih: -1 })
      .exec();

    return kararlar.map((doc) => ({
      id: doc._id.toString(),
      kararNo: doc.kararNo,
      kategori: doc.kategori,
      tarih: doc.tarih.toISOString(),
      baslik: doc.baslik,
    }));
  }
}
