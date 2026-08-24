import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  FaturaOdemeKurumu,
  FaturaOdemeKurumuDocument,
} from './schemas/fatura-odeme-kurumu.schema';

export interface PublicFaturaOdemeKurumu {
  id: string;
  ad: string;
  aciklama: string;
  url: string;
}

@Injectable()
export class FaturaOdemeService {
  constructor(
    @InjectModel(FaturaOdemeKurumu.name)
    private readonly kurumModel: Model<FaturaOdemeKurumuDocument>,
  ) {}

  async findAll(): Promise<PublicFaturaOdemeKurumu[]> {
    const kurumlar = await this.kurumModel.find().sort({ createdAt: 1 }).exec();
    return kurumlar.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      aciklama: doc.aciklama,
      url: doc.url,
    }));
  }
}
