import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateSehirKamerasiDto } from './dto/create-sehir-kamerasi.dto';
import { UpdateSehirKamerasiDto } from './dto/update-sehir-kamerasi.dto';
import {
  SehirKamerasi,
  SehirKamerasiDocument,
} from './schemas/sehir-kamerasi.schema';

export interface AdminSehirKamerasi {
  id: string;
  ad: string;
  online: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedSehirKamerasi = SehirKamerasiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminSehirKameralariService {
  constructor(
    @InjectModel(SehirKamerasi.name)
    private readonly sehirKamerasiModel: Model<SehirKamerasiDocument>,
  ) {}

  async findAll(): Promise<AdminSehirKamerasi[]> {
    const kameralar = await this.sehirKamerasiModel
      .find()
      .sort({ ad: 1 })
      .exec();
    return kameralar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedSehirKamerasi),
    );
  }

  async findOne(id: string): Promise<AdminSehirKamerasi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.sehirKamerasiModel.findById(id).exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedSehirKamerasi)
      : null;
  }

  async create(
    dto: CreateSehirKamerasiDto,
    updatedBy: string,
  ): Promise<AdminSehirKamerasi> {
    const created = (await this.sehirKamerasiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedSehirKamerasi;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateSehirKamerasiDto,
    updatedBy: string,
  ): Promise<AdminSehirKamerasi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.sehirKamerasiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedSehirKamerasi)
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.sehirKamerasiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedSehirKamerasi): AdminSehirKamerasi {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      online: doc.online,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
