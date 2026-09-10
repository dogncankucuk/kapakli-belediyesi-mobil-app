import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SaglikKurumu,
  SaglikKurumuDocument,
} from './schemas/saglik-kurumu.schema';

export interface PublicSaglikKurumu {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class SaglikService {
  constructor(
    @InjectModel(SaglikKurumu.name)
    private readonly saglikKurumuModel: Model<SaglikKurumuDocument>,
  ) {}

  async findAll(): Promise<PublicSaglikKurumu[]> {
    const kurumlar = await this.saglikKurumuModel.find().sort({ ad: 1 }).exec();

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
