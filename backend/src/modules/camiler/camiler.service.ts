import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Cami, CamiDocument } from './schemas/cami.schema';

export interface PublicCami {
  id: string;
  ad: string;
  adres: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class CamilerService {
  constructor(
    @InjectModel(Cami.name)
    private readonly camiModel: Model<CamiDocument>,
  ) {}

  async findAll(): Promise<PublicCami[]> {
    const camiler = await this.camiModel.find().sort({ ad: 1 }).exec();

    return camiler.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
    }));
  }
}
