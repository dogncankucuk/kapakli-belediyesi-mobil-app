import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Haber, HaberDocument } from './schemas/haber.schema';

export interface PublicHaber {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
}

@Injectable()
export class HaberlerService {
  constructor(
    @InjectModel(Haber.name)
    private readonly haberModel: Model<HaberDocument>,
  ) {}

  async findAll(): Promise<PublicHaber[]> {
    const haberler = await this.haberModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return haberler.map((doc) => ({
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
