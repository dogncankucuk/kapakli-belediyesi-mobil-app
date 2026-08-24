import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  YardimMerkeziSoru,
  YardimMerkeziSoruDocument,
} from './schemas/yardim-merkezi-soru.schema';

export interface PublicYardimMerkeziSoru {
  id: string;
  soru: string;
  cevap: string;
}

@Injectable()
export class YardimMerkeziService {
  constructor(
    @InjectModel(YardimMerkeziSoru.name)
    private readonly soruModel: Model<YardimMerkeziSoruDocument>,
  ) {}

  async findAll(): Promise<PublicYardimMerkeziSoru[]> {
    const sorular = await this.soruModel.find().sort({ createdAt: 1 }).exec();
    return sorular.map((doc) => ({
      id: doc._id.toString(),
      soru: doc.soru,
      cevap: doc.cevap,
    }));
  }
}
