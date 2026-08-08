import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Park, ParkDocument } from './schemas/park.schema';

export interface PublicPark {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
}

@Injectable()
export class ParklarService {
  constructor(
    @InjectModel(Park.name)
    private readonly parkModel: Model<ParkDocument>,
  ) {}

  async findAll(): Promise<PublicPark[]> {
    const parklar = await this.parkModel.find().sort({ ad: 1 }).exec();

    return parklar.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      tur: doc.tur,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
    }));
  }
}
