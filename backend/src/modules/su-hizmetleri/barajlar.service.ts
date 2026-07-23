import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Baraj, BarajDocument } from './schemas/baraj.schema';

export interface PublicBaraj {
  id: string;
  ad: string;
  doluluk: number;
}

@Injectable()
export class BarajlarService {
  constructor(
    @InjectModel(Baraj.name)
    private readonly barajModel: Model<BarajDocument>,
  ) {}

  async findAll(): Promise<PublicBaraj[]> {
    const barajlar = await this.barajModel.find().sort({ ad: 1 }).exec();

    return barajlar.map((doc) => ({
      id: doc._id.toString(),
      ad: doc.ad,
      doluluk: doc.doluluk,
    }));
  }
}
