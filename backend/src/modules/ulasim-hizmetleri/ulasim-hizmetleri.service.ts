import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  UlasimSecenegi,
  UlasimSecenegiDocument,
} from './schemas/ulasim-secenegi.schema';

export interface PublicUlasimSecenegi {
  id: string;
  baslik: string;
  aciklama: string;
  url: string;
}

@Injectable()
export class UlasimHizmetleriService {
  constructor(
    @InjectModel(UlasimSecenegi.name)
    private readonly secenekModel: Model<UlasimSecenegiDocument>,
  ) {}

  async findAll(): Promise<PublicUlasimSecenegi[]> {
    const secenekler = await this.secenekModel
      .find()
      .sort({ createdAt: 1 })
      .exec();
    return secenekler.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      aciklama: doc.aciklama,
      url: doc.url,
    }));
  }
}
