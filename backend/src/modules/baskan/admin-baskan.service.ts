import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UpdateBaskanDto } from './dto/update-baskan.dto';
import { Baskan, BaskanDocument } from './schemas/baskan.schema';

export interface AdminBaskan {
  ad: string;
  photoUrl: string | null;
  introText: string;
  maddeler: string[];
  kapanisText: string;
  updatedBy: string | null;
}

@Injectable()
export class AdminBaskanService {
  constructor(
    @InjectModel(Baskan.name)
    private readonly baskanModel: Model<BaskanDocument>,
  ) {}

  async get(): Promise<AdminBaskan> {
    const doc = await this.baskanModel.findOne().exec();
    return this.toAdmin(doc);
  }

  async update(dto: UpdateBaskanDto, updatedBy: string): Promise<AdminBaskan> {
    const doc = await this.baskanModel
      .findOneAndUpdate({}, { ...dto, updatedBy }, { new: true, upsert: true })
      .exec();
    return this.toAdmin(doc);
  }

  private toAdmin(doc: BaskanDocument | null): AdminBaskan {
    return {
      ad: doc?.ad ?? '',
      photoUrl: doc?.photoUrl ?? null,
      introText: doc?.introText ?? '',
      maddeler: doc?.maddeler ?? [],
      kapanisText: doc?.kapanisText ?? '',
      updatedBy: doc?.updatedBy ?? null,
    };
  }
}
