import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  BasvuruHizmeti,
  BasvuruHizmetiDocument,
} from './schemas/basvuru-hizmeti.schema';

export interface PublicBasvuruHizmeti {
  id: string;
  baslik: string;
  ozet: string;
  hizmetler: string[];
  kosullar: string[];
  calismaSaatleri: string | null;
  sorumluBirim: string | null;
  basvuruTuru: string;
  basvuruDegeri: string;
}

@Injectable()
export class BasvuruHizmetleriService {
  constructor(
    @InjectModel(BasvuruHizmeti.name)
    private readonly basvuruHizmetiModel: Model<BasvuruHizmetiDocument>,
  ) {}

  async findAll(): Promise<PublicBasvuruHizmeti[]> {
    const hizmetler = await this.basvuruHizmetiModel
      .find()
      .sort({ baslik: 1 })
      .exec();

    return hizmetler.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      ozet: doc.ozet,
      hizmetler: doc.hizmetler,
      kosullar: doc.kosullar,
      calismaSaatleri: doc.calismaSaatleri ?? null,
      sorumluBirim: doc.sorumluBirim ?? null,
      basvuruTuru: doc.basvuruTuru,
      basvuruDegeri: doc.basvuruDegeri,
    }));
  }
}
