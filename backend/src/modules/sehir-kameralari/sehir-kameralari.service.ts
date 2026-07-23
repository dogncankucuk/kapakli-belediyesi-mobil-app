import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SehirKamerasi,
  SehirKamerasiDocument,
} from './schemas/sehir-kamerasi.schema';

export interface PublicSehirKamerasi {
  id: string;
  ad: string;
  online: boolean;
}

@Injectable()
export class SehirKameralariService {
  constructor(
    @InjectModel(SehirKamerasi.name)
    private readonly sehirKamerasiModel: Model<SehirKamerasiDocument>,
  ) {}

  async findAll(): Promise<PublicSehirKamerasi[]> {
    const kameralar = await this.sehirKamerasiModel
      .find()
      .sort({ ad: 1 })
      .exec();

    return kameralar.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      online: doc.online,
    }));
  }
}
