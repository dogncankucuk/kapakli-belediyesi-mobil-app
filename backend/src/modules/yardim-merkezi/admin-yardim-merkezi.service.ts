import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateYardimMerkeziSoruDto } from './dto/create-yardim-merkezi-soru.dto';
import { UpdateYardimMerkeziSoruDto } from './dto/update-yardim-merkezi-soru.dto';
import {
  YardimMerkeziSoru,
  YardimMerkeziSoruDocument,
} from './schemas/yardim-merkezi-soru.schema';

export interface AdminYardimMerkeziSoru {
  id: string;
  soru: string;
  cevap: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedSoru = YardimMerkeziSoruDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminYardimMerkeziService {
  constructor(
    @InjectModel(YardimMerkeziSoru.name)
    private readonly soruModel: Model<YardimMerkeziSoruDocument>,
  ) {}

  async findAll(): Promise<AdminYardimMerkeziSoru[]> {
    const sorular = await this.soruModel.find().sort({ createdAt: 1 }).exec();
    return sorular.map((doc) => this.toAdmin(doc as unknown as TimestampedSoru));
  }

  async findOne(id: string): Promise<AdminYardimMerkeziSoru | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.soruModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedSoru) : null;
  }

  async create(
    dto: CreateYardimMerkeziSoruDto,
    updatedBy: string,
  ): Promise<AdminYardimMerkeziSoru> {
    const created = (await this.soruModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedSoru;

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateYardimMerkeziSoruDto,
    updatedBy: string,
  ): Promise<AdminYardimMerkeziSoru | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.soruModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedSoru) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.soruModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedSoru): AdminYardimMerkeziSoru {
    return {
      id: doc._id.toString(),
      soru: doc.soru,
      cevap: doc.cevap,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
