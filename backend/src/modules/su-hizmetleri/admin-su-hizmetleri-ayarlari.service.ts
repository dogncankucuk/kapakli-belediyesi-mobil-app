import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateSuHizmetleriAyarlariDto } from './dto/update-su-hizmetleri-ayarlari.dto';
import {
  SuHizmetleriAyarlari,
  SuHizmetleriAyarlariDocument,
} from './schemas/su-hizmetleri-ayarlari.schema';

export interface AdminSuHizmetleriAyarlari {
  kesintilerKaynakUrl: string;
  kesintilerGoruntulemeUrl: string;
  updatedBy: string | null;
}

@Injectable()
export class AdminSuHizmetleriAyarlariService {
  constructor(
    @InjectModel(SuHizmetleriAyarlari.name)
    private readonly ayarlarModel: Model<SuHizmetleriAyarlariDocument>,
  ) {}

  async get(): Promise<AdminSuHizmetleriAyarlari> {
    const doc = await this.ayarlarModel.findOne().exec();
    return this.toAdmin(doc);
  }

  async update(
    dto: UpdateSuHizmetleriAyarlariDto,
    updatedBy: string,
  ): Promise<AdminSuHizmetleriAyarlari> {
    const doc = await this.ayarlarModel
      .findOneAndUpdate({}, { ...dto, updatedBy }, { new: true, upsert: true })
      .exec();
    return this.toAdmin(doc);
  }

  private toAdmin(
    doc: SuHizmetleriAyarlariDocument | null,
  ): AdminSuHizmetleriAyarlari {
    return {
      kesintilerKaynakUrl: doc?.kesintilerKaynakUrl ?? '',
      kesintilerGoruntulemeUrl: doc?.kesintilerGoruntulemeUrl ?? '',
      updatedBy: doc?.updatedBy ?? null,
    };
  }
}
