import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  UlasimHatti,
  UlasimHattiDocument,
} from './schemas/ulasim-hatti.schema';

export interface PublicUlasimHatti {
  id: string;
  hatAdi: string;
  guzergah: string;
  durum: string;
  canli: boolean;
}

@Injectable()
export class UlasimHatlariService {
  constructor(
    @InjectModel(UlasimHatti.name)
    private readonly ulasimHattiModel: Model<UlasimHattiDocument>,
  ) {}

  async findAll(): Promise<PublicUlasimHatti[]> {
    const hatlar = await this.ulasimHattiModel
      .find()
      .sort({ hatAdi: 1 })
      .exec();

    return hatlar.map((doc) => ({
      id: doc._id.toString(),
      hatAdi: doc.hatAdi,
      guzergah: doc.guzergah,
      durum: doc.durum,
      canli: doc.canli,
    }));
  }
}
