import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BizeUlasin, BizeUlasinDocument } from './schemas/bize-ulasin.schema';

export interface PublicBizeUlasin {
  telefon: string;
  whatsapp: string;
  eposta: string;
  adres: string;
  lat: number;
  lng: number;
}

@Injectable()
export class BizeUlasinService {
  constructor(
    @InjectModel(BizeUlasin.name)
    private readonly bizeUlasinModel: Model<BizeUlasinDocument>,
  ) {}

  async get(): Promise<PublicBizeUlasin> {
    const doc = await this.bizeUlasinModel.findOne().exec();
    return {
      telefon: doc?.telefon ?? '',
      whatsapp: doc?.whatsapp ?? '',
      eposta: doc?.eposta ?? '',
      adres: doc?.adres ?? '',
      lat: doc?.lat ?? 0,
      lng: doc?.lng ?? 0,
    };
  }
}
