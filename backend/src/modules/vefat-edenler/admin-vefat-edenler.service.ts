import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateVefatIlaniDto } from './dto/create-vefat-ilani.dto';
import { UpdateVefatIlaniDto } from './dto/update-vefat-ilani.dto';
import { VefatIlani, VefatIlaniDocument } from './schemas/vefat-ilani.schema';

export interface AdminVefatIlani {
  id: string;
  adSoyad: string;
  yas: number;
  not: string;
  mekan: string;
  namazVakti: string;
  tarih: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedVefatIlani = VefatIlaniDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminVefatEdenlerService {
  constructor(
    @InjectModel(VefatIlani.name)
    private readonly vefatIlaniModel: Model<VefatIlaniDocument>,
  ) {}

  async findAll(): Promise<AdminVefatIlani[]> {
    const ilanlar = await this.vefatIlaniModel
      .find()
      .sort({ tarih: -1 })
      .exec();
    return ilanlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedVefatIlani),
    );
  }

  async findOne(id: string): Promise<AdminVefatIlani | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.vefatIlaniModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedVefatIlani) : null;
  }

  async create(
    dto: CreateVefatIlaniDto,
    updatedBy: string,
  ): Promise<AdminVefatIlani> {
    const created = (await this.vefatIlaniModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedVefatIlani;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateVefatIlaniDto,
    updatedBy: string,
  ): Promise<AdminVefatIlani | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.vefatIlaniModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedVefatIlani) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.vefatIlaniModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedVefatIlani): AdminVefatIlani {
    return {
      id: doc._id.toString(),
      adSoyad: doc.adSoyad,
      yas: doc.yas,
      not: doc.not,
      mekan: doc.mekan,
      namazVakti: doc.namazVakti,
      tarih: doc.tarih.toISOString(),
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
