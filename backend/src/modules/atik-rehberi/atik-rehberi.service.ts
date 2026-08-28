import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ATIK_TURLERI } from './atik-turleri.const';
import {
  AtikRehberiIcerik,
  AtikRehberiIcerikDocument,
} from './schemas/atik-rehberi-icerik.schema';

export interface PublicAtikRehberiIcerik {
  tur: string;
  aciklama: string;
}

@Injectable()
export class AtikRehberiService {
  constructor(
    @InjectModel(AtikRehberiIcerik.name)
    private readonly atikRehberiModel: Model<AtikRehberiIcerikDocument>,
  ) {}

  async findAll(): Promise<PublicAtikRehberiIcerik[]> {
    const kayitlar = await this.atikRehberiModel.find().exec();
    const map = new Map(kayitlar.map((k) => [k.tur, k.aciklama]));
    return ATIK_TURLERI.map((tur) => ({
      tur,
      aciklama: map.get(tur) ?? '',
    }));
  }
}
