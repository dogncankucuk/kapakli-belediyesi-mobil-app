import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TarihiYer, TarihiYerDocument } from './schemas/tarihi-yer.schema';

export interface PublicTarihiYer {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class TarihiYerlerService {
  constructor(
    @InjectModel(TarihiYer.name)
    private readonly tarihiYerModel: Model<TarihiYerDocument>,
  ) {}

  async findAll(): Promise<PublicTarihiYer[]> {
    const yerler = await this.tarihiYerModel.find().sort({ ad: 1 }).exec();

    return yerler.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      tur: doc.tur,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
    }));
  }
}
