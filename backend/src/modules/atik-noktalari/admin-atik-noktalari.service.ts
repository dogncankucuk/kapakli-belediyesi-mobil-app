import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateAtikNoktasiDto } from './dto/create-atik-noktasi.dto';
import { UpdateAtikNoktasiDto } from './dto/update-atik-noktasi.dto';
import {
  AtikNoktasi,
  AtikNoktasiDocument,
} from './schemas/atik-noktasi.schema';

export interface AdminAtikNoktasi {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedAtikNoktasi = AtikNoktasiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminAtikNoktalariService {
  constructor(
    @InjectModel(AtikNoktasi.name)
    private readonly atikNoktasiModel: Model<AtikNoktasiDocument>,
  ) {}

  async findAll(): Promise<AdminAtikNoktasi[]> {
    const noktalar = await this.atikNoktasiModel.find().sort({ ad: 1 }).exec();
    return noktalar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedAtikNoktasi),
    );
  }

  async findOne(id: string): Promise<AdminAtikNoktasi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.atikNoktasiModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAtikNoktasi) : null;
  }

  async create(
    dto: CreateAtikNoktasiDto,
    updatedBy: string,
  ): Promise<AdminAtikNoktasi> {
    const created = (await this.atikNoktasiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedAtikNoktasi;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateAtikNoktasiDto,
    updatedBy: string,
  ): Promise<AdminAtikNoktasi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.atikNoktasiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAtikNoktasi) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.atikNoktasiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedAtikNoktasi): AdminAtikNoktasi {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      tur: doc.tur,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
