import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Hakkimizda, HakkimizdaDocument } from './schemas/hakkimizda.schema';

export interface PublicHakkimizda {
  baskanOzetMetni: string;
  tarihcePhotoUrl: string | null;
  tarihceParagraflari: string[];
  kurulusYili: string;
  buyuksehirYili: string;
  nufus: string;
}

@Injectable()
export class HakkimizdaService {
  constructor(
    @InjectModel(Hakkimizda.name)
    private readonly hakkimizdaModel: Model<HakkimizdaDocument>,
  ) {}

  async get(): Promise<PublicHakkimizda> {
    const doc = await this.hakkimizdaModel.findOne().exec();
    return {
      baskanOzetMetni: doc?.baskanOzetMetni ?? '',
      tarihcePhotoUrl: doc?.tarihcePhotoUrl ?? null,
      tarihceParagraflari: doc?.tarihceParagraflari ?? [],
      kurulusYili: doc?.kurulusYili ?? '',
      buyuksehirYili: doc?.buyuksehirYili ?? '',
      nufus: doc?.nufus ?? '',
    };
  }
}
