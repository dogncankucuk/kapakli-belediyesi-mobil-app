import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  MeclisGundemi,
  MeclisGundemiDocument,
} from './schemas/meclis-gundemi.schema';

export interface PublicMeclisGundemi {
  id: string;
  baslik: string;
  tarih: string;
  icerik: string;
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
}

@Injectable()
export class MeclisGundemleriService {
  constructor(
    @InjectModel(MeclisGundemi.name)
    private readonly meclisGundemiModel: Model<MeclisGundemiDocument>,
  ) {}

  async findAll(): Promise<PublicMeclisGundemi[]> {
    const gundemler = await this.meclisGundemiModel
      .find()
      .sort({ tarih: -1 })
      .exec();

    return gundemler.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      tarih: doc.tarih.toISOString(),
      icerik: doc.icerik ?? '',
      dosyaUrlleri: doc.dosyaUrlleri ?? [],
      youtubeUrl: doc.youtubeUrl ?? null,
    }));
  }
}
