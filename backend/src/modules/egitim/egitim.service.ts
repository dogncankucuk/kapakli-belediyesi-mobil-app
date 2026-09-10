import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  EgitimKurumu,
  EgitimKurumuDocument,
} from './schemas/egitim-kurumu.schema';

export interface PublicEgitimKurumu {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class EgitimService {
  constructor(
    @InjectModel(EgitimKurumu.name)
    private readonly egitimKurumuModel: Model<EgitimKurumuDocument>,
  ) {}

  async findAll(): Promise<PublicEgitimKurumu[]> {
    const kurumlar = await this.egitimKurumuModel.find().sort({ ad: 1 }).exec();

    return kurumlar.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      tur: doc.tur,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
    }));
  }
}
