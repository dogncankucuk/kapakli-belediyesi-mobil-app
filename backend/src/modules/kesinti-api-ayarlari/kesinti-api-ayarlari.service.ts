import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  KesintiApiAyari,
  KesintiApiAyariDocument,
  KesintiApiTuru,
} from './schemas/kesinti-api-ayari.schema';

@Injectable()
export class KesintiApiAyarlariService {
  constructor(
    @InjectModel(KesintiApiAyari.name)
    private readonly kesintiApiAyariModel: Model<KesintiApiAyariDocument>,
  ) {}

  // Su/elektrik senkronizasyon servisleri tarafindan kullanilir - donen
  // deger disinda ayarin kendisi (updatedBy, dokuman vb.) hic disari sizmaz.
  async getApiUrl(tur: KesintiApiTuru): Promise<string> {
    const doc = await this.kesintiApiAyariModel.findOne({ tur }).exec();
    return doc?.apiUrl ?? '';
  }

  async getForAdmin(tur: KesintiApiTuru): Promise<{ apiUrl: string }> {
    const doc = await this.kesintiApiAyariModel.findOne({ tur }).exec();
    return { apiUrl: doc?.apiUrl ?? '' };
  }

  async setApiUrl(
    tur: KesintiApiTuru,
    apiUrl: string,
    updatedBy: string,
  ): Promise<{ apiUrl: string }> {
    const doc = await this.kesintiApiAyariModel
      .findOneAndUpdate(
        { tur },
        { tur, apiUrl, updatedBy },
        { new: true, upsert: true },
      )
      .exec();
    return { apiUrl: doc.apiUrl };
  }
}
