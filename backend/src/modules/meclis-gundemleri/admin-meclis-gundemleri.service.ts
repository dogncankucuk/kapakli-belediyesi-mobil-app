import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateMeclisGundemiDto } from './dto/create-meclis-gundemi.dto';
import { UpdateMeclisGundemiDto } from './dto/update-meclis-gundemi.dto';
import {
  MeclisGundemi,
  MeclisGundemiDocument,
} from './schemas/meclis-gundemi.schema';

export interface AdminMeclisGundemi {
  id: string;
  baslik: string;
  tarih: string;
  icerik: string;
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedMeclisGundemi = MeclisGundemiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminMeclisGundemleriService {
  constructor(
    @InjectModel(MeclisGundemi.name)
    private readonly meclisGundemiModel: Model<MeclisGundemiDocument>,
  ) {}

  async findAll(): Promise<AdminMeclisGundemi[]> {
    const gundemler = await this.meclisGundemiModel
      .find()
      .sort({ tarih: -1 })
      .exec();

    return gundemler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedMeclisGundemi),
    );
  }

  async findOne(id: string): Promise<AdminMeclisGundemi | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.meclisGundemiModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedMeclisGundemi) : null;
  }

  async create(
    dto: CreateMeclisGundemiDto,
    updatedBy: string,
  ): Promise<AdminMeclisGundemi> {
    const created = (await this.meclisGundemiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedMeclisGundemi;

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateMeclisGundemiDto,
    updatedBy: string,
  ): Promise<AdminMeclisGundemi | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.meclisGundemiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedMeclisGundemi) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.meclisGundemiModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedMeclisGundemi): AdminMeclisGundemi {
    return {
      id: doc._id.toString(),
      baslik: doc.baslik,
      tarih: doc.tarih.toISOString(),
      icerik: doc.icerik ?? '',
      dosyaUrlleri: doc.dosyaUrlleri ?? [],
      youtubeUrl: doc.youtubeUrl ?? null,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
