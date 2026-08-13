import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  AtikNoktasi,
  AtikNoktasiDocument,
} from './schemas/atik-noktasi.schema';

export interface PublicAtikNoktasi {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class AtikNoktalariService {
  constructor(
    @InjectModel(AtikNoktasi.name)
    private readonly atikNoktasiModel: Model<AtikNoktasiDocument>,
  ) {}

  async findAll(): Promise<PublicAtikNoktasi[]> {
    const noktalar = await this.atikNoktasiModel.find().sort({ ad: 1 }).exec();

    return noktalar.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      tur: doc.tur,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
    }));
  }
}
