import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateBizeUlasinDto } from './dto/update-bize-ulasin.dto';
import { BizeUlasin, BizeUlasinDocument } from './schemas/bize-ulasin.schema';

export interface AdminBizeUlasin {
  telefon: string;
  whatsapp: string;
  eposta: string;
  adres: string;
  lat: number;
  lng: number;
  updatedBy: string | null;
}

@Injectable()
export class AdminBizeUlasinService {
  constructor(
    @InjectModel(BizeUlasin.name)
    private readonly bizeUlasinModel: Model<BizeUlasinDocument>,
  ) {}

  async get(): Promise<AdminBizeUlasin> {
    const doc = await this.bizeUlasinModel.findOne().exec();
    return this.toAdmin(doc);
  }

  async update(
    dto: UpdateBizeUlasinDto,
    updatedBy: string,
  ): Promise<AdminBizeUlasin> {
    const doc = await this.bizeUlasinModel
      .findOneAndUpdate({}, { ...dto, updatedBy }, { new: true, upsert: true })
      .exec();
    return this.toAdmin(doc);
  }

  private toAdmin(doc: BizeUlasinDocument | null): AdminBizeUlasin {
    return {
      telefon: doc?.telefon ?? '',
      whatsapp: doc?.whatsapp ?? '',
      eposta: doc?.eposta ?? '',
      adres: doc?.adres ?? '',
      lat: doc?.lat ?? 0,
      lng: doc?.lng ?? 0,
      updatedBy: doc?.updatedBy ?? null,
    };
  }
}
