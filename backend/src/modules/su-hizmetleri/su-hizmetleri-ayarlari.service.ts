import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SuHizmetleriAyarlari,
  SuHizmetleriAyarlariDocument,
} from './schemas/su-hizmetleri-ayarlari.schema';

export interface PublicSuHizmetleriAyarlari {
  kesintilerGoruntulemeUrl: string;
}

@Injectable()
export class SuHizmetleriAyarlariService {
  constructor(
    @InjectModel(SuHizmetleriAyarlari.name)
    private readonly ayarlarModel: Model<SuHizmetleriAyarlariDocument>,
  ) {}

  async get(): Promise<PublicSuHizmetleriAyarlari> {
    const doc = await this.ayarlarModel.findOne().exec();
    return {
      kesintilerGoruntulemeUrl: doc?.kesintilerGoruntulemeUrl ?? '',
    };
  }
}
