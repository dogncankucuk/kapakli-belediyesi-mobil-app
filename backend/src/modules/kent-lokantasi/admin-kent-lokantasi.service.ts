import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateGununMenusuDto } from './dto/create-gunun-menusu.dto';
import { UpdateGununMenusuDto } from './dto/update-gunun-menusu.dto';
import {
  GununMenusu,
  GununMenusuDocument,
} from './schemas/gunun-menusu.schema';

export interface AdminGununMenusu {
  id: string;
  tarih: string;
  kalemler: { ad: string; aciklama: string }[];
  fiyat: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedGununMenusu = GununMenusuDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminKentLokantasiService {
  constructor(
    @InjectModel(GununMenusu.name)
    private readonly gununMenusuModel: Model<GununMenusuDocument>,
  ) {}

  async findAll(): Promise<AdminGununMenusu[]> {
    const menuler = await this.gununMenusuModel
      .find()
      .sort({ tarih: -1 })
      .exec();
    return menuler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedGununMenusu),
    );
  }

  async findOne(id: string): Promise<AdminGununMenusu | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.gununMenusuModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedGununMenusu) : null;
  }

  async create(
    dto: CreateGununMenusuDto,
    updatedBy: string,
  ): Promise<AdminGununMenusu> {
    const created = (await this.gununMenusuModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedGununMenusu;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateGununMenusuDto,
    updatedBy: string,
  ): Promise<AdminGununMenusu | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.gununMenusuModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedGununMenusu) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.gununMenusuModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedGununMenusu): AdminGununMenusu {
    return {
      id: doc._id.toString(),
      tarih: doc.tarih.toISOString(),
      kalemler: doc.kalemler.map((k) => ({ ad: k.ad, aciklama: k.aciklama })),
      fiyat: doc.fiyat,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
