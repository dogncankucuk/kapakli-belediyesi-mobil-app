import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Makale, MakaleDocument } from './schemas/makale.schema';

export interface PublicMakale {
  id: string;
  baslik: string;
  icerik: string;
  resimUrl: string | null;
  yayinTarihi: string;
}

@Injectable()
export class MakalelerService {
  constructor(
    @InjectModel(Makale.name)
    private readonly makaleModel: Model<MakaleDocument>,
  ) {}

  async findAll(): Promise<PublicMakale[]> {
    const makaleler = await this.makaleModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return makaleler.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      icerik: doc.icerik,
      resimUrl: doc.resimUrl ?? null,
      yayinTarihi: doc.yayinTarihi.toISOString(),
    }));
  }
}
