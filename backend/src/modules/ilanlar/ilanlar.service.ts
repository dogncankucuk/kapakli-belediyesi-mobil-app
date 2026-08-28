import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Ilan, IlanDocument } from './schemas/ilan.schema';

export interface PublicIlan {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
}

@Injectable()
export class IlanlarService {
  constructor(
    @InjectModel(Ilan.name)
    private readonly ilanModel: Model<IlanDocument>,
  ) {}

  async findAll(): Promise<PublicIlan[]> {
    const ilanlar = await this.ilanModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return ilanlar.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      icerik: doc.icerik,
      resimUrlleri: doc.resimUrlleri ?? [],
      dosyaUrlleri: doc.dosyaUrlleri ?? [],
      youtubeUrl: doc.youtubeUrl ?? null,
      yayinTarihi: doc.yayinTarihi.toISOString(),
    }));
  }
}
