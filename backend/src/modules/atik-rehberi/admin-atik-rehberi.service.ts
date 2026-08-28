import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ATIK_TURLERI } from './atik-turleri.const';
import { UpdateAtikRehberiIcerikDto } from './dto/update-atik-rehberi-icerik.dto';
import {
  AtikRehberiIcerik,
  AtikRehberiIcerikDocument,
} from './schemas/atik-rehberi-icerik.schema';

export interface AdminAtikRehberiIcerik {
  tur: string;
  aciklama: string;
  updatedBy: string | null;
}

@Injectable()
export class AdminAtikRehberiService {
  constructor(
    @InjectModel(AtikRehberiIcerik.name)
    private readonly atikRehberiModel: Model<AtikRehberiIcerikDocument>,
  ) {}

  async findAll(): Promise<AdminAtikRehberiIcerik[]> {
    const kayitlar = await this.atikRehberiModel.find().exec();
    const map = new Map(kayitlar.map((k) => [k.tur, k]));
    return ATIK_TURLERI.map((tur) => {
      const kayit = map.get(tur);
      return {
        tur,
        aciklama: kayit?.aciklama ?? '',
        updatedBy: kayit?.updatedBy ?? null,
      };
    });
  }

  async update(
    dto: UpdateAtikRehberiIcerikDto,
    updatedBy: string,
  ): Promise<AdminAtikRehberiIcerik> {
    const doc = await this.atikRehberiModel
      .findOneAndUpdate(
        { tur: dto.tur },
        { tur: dto.tur, aciklama: dto.aciklama, updatedBy },
        { new: true, upsert: true },
      )
      .exec();
    return {
      tur: doc.tur,
      aciklama: doc.aciklama,
      updatedBy: doc.updatedBy ?? null,
    };
  }
}
