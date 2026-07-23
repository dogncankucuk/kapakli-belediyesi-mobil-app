import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateMeclisKarariDto } from './dto/create-meclis-karari.dto';
import { UpdateMeclisKarariDto } from './dto/update-meclis-karari.dto';
import {
  MeclisKarari,
  MeclisKarariDocument,
} from './schemas/meclis-karari.schema';

export interface AdminMeclisKarari {
  id: string;
  kararNo: string;
  kategori: string;
  tarih: string;
  baslik: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedMeclisKarari = MeclisKarariDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminMeclisKararlariService {
  constructor(
    @InjectModel(MeclisKarari.name)
    private readonly meclisKarariModel: Model<MeclisKarariDocument>,
  ) {}

  async findAll(): Promise<AdminMeclisKarari[]> {
    const kararlar = await this.meclisKarariModel
      .find()
      .sort({ tarih: -1 })
      .exec();
    return kararlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedMeclisKarari),
    );
  }

  async findOne(id: string): Promise<AdminMeclisKarari | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.meclisKarariModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedMeclisKarari) : null;
  }

  async create(
    dto: CreateMeclisKarariDto,
    updatedBy: string,
  ): Promise<AdminMeclisKarari> {
    const created = (await this.meclisKarariModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedMeclisKarari;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateMeclisKarariDto,
    updatedBy: string,
  ): Promise<AdminMeclisKarari | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.meclisKarariModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedMeclisKarari) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.meclisKarariModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedMeclisKarari): AdminMeclisKarari {
    return {
      id: doc._id.toString(),
      kararNo: doc.kararNo,
      kategori: doc.kategori,
      tarih: doc.tarih.toISOString(),
      baslik: doc.baslik,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
