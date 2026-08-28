import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Ihale, IhaleDocument } from './schemas/ihale.schema';

export interface PublicIhale {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
}

@Injectable()
export class IhalelerService {
  constructor(
    @InjectModel(Ihale.name)
    private readonly ihaleModel: Model<IhaleDocument>,
  ) {}

  async findAll(): Promise<PublicIhale[]> {
    const ihaleler = await this.ihaleModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return ihaleler.map((doc) => ({
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
