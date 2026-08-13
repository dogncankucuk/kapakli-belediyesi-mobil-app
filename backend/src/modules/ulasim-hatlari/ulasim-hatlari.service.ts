import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  UlasimHatti,
  UlasimHattiDocument,
} from './schemas/ulasim-hatti.schema';
import {
  CanliOtobus,
  TekulasCanliTakipService,
} from './tekulas-canli-takip.service';

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
    private readonly tekulasCanliTakipService: TekulasCanliTakipService,
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

  async getCanliOtobusler(id: string): Promise<CanliOtobus[]> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException();
    }
    const hat = await this.ulasimHattiModel.findById(id).exec();
    if (!hat) {
      throw new NotFoundException();
    }
    if (!hat.hatKodu) {
      return [];
    }
    return this.tekulasCanliTakipService.getCanliOtobusler(hat.hatKodu);
  }
}
