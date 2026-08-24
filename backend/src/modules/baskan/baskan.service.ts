import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Baskan, BaskanDocument } from './schemas/baskan.schema';

export interface PublicBaskan {
  ad: string;
  photoUrl: string | null;
  introText: string;
  maddeler: string[];
  kapanisText: string;
}

@Injectable()
export class BaskanService {
  constructor(
    @InjectModel(Baskan.name)
    private readonly baskanModel: Model<BaskanDocument>,
  ) {}

  async get(): Promise<PublicBaskan> {
    const doc = await this.baskanModel.findOne().exec();
    return {
      ad: doc?.ad ?? '',
      photoUrl: doc?.photoUrl ?? null,
      introText: doc?.introText ?? '',
      maddeler: doc?.maddeler ?? [],
      kapanisText: doc?.kapanisText ?? '',
    };
  }
}
