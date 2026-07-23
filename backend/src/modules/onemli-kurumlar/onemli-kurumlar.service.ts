import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  OnemliKurum,
  OnemliKurumDocument,
} from './schemas/onemli-kurum.schema';

export interface PublicOnemliKurum {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class OnemliKurumlarService {
  constructor(
    @InjectModel(OnemliKurum.name)
    private readonly onemliKurumModel: Model<OnemliKurumDocument>,
  ) {}

  async findAll(): Promise<PublicOnemliKurum[]> {
    const kurumlar = await this.onemliKurumModel.find().sort({ ad: 1 }).exec();

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
