import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateUlasimHattiDto } from './dto/create-ulasim-hatti.dto';
import { UpdateUlasimHattiDto } from './dto/update-ulasim-hatti.dto';
import {
  UlasimHatti,
  UlasimHattiDocument,
} from './schemas/ulasim-hatti.schema';

export interface AdminUlasimHatti {
  id: string;
  hatAdi: string;
  guzergah: string;
  durum: string;
  canli: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedUlasimHatti = UlasimHattiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminUlasimHatlariService {
  constructor(
    @InjectModel(UlasimHatti.name)
    private readonly ulasimHattiModel: Model<UlasimHattiDocument>,
  ) {}

  async findAll(): Promise<AdminUlasimHatti[]> {
    const hatlar = await this.ulasimHattiModel
      .find()
      .sort({ hatAdi: 1 })
      .exec();
    return hatlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedUlasimHatti),
    );
  }

  async findOne(id: string): Promise<AdminUlasimHatti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.ulasimHattiModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedUlasimHatti) : null;
  }

  async create(
    dto: CreateUlasimHattiDto,
    updatedBy: string,
  ): Promise<AdminUlasimHatti> {
    const created = (await this.ulasimHattiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedUlasimHatti;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateUlasimHattiDto,
    updatedBy: string,
  ): Promise<AdminUlasimHatti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.ulasimHattiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedUlasimHatti) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.ulasimHattiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedUlasimHatti): AdminUlasimHatti {
    return {
      id: doc._id.toString(),
      hatAdi: doc.hatAdi,
      guzergah: doc.guzergah,
      durum: doc.durum,
      canli: doc.canli,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
