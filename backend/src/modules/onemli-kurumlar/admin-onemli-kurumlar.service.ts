import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateOnemliKurumDto } from './dto/create-onemli-kurum.dto';
import { UpdateOnemliKurumDto } from './dto/update-onemli-kurum.dto';
import {
  OnemliKurum,
  OnemliKurumDocument,
} from './schemas/onemli-kurum.schema';

export interface AdminOnemliKurum {
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

type TimestampedOnemliKurum = OnemliKurumDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminOnemliKurumlarService {
  constructor(
    @InjectModel(OnemliKurum.name)
    private readonly onemliKurumModel: Model<OnemliKurumDocument>,
  ) {}

  async findAll(): Promise<AdminOnemliKurum[]> {
    const kurumlar = await this.onemliKurumModel.find().sort({ ad: 1 }).exec();
    return kurumlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedOnemliKurum),
    );
  }

  async findOne(id: string): Promise<AdminOnemliKurum | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.onemliKurumModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedOnemliKurum) : null;
  }

  async create(
    dto: CreateOnemliKurumDto,
    updatedBy: string,
  ): Promise<AdminOnemliKurum> {
    const created = (await this.onemliKurumModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedOnemliKurum;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateOnemliKurumDto,
    updatedBy: string,
  ): Promise<AdminOnemliKurum | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.onemliKurumModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedOnemliKurum) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.onemliKurumModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedOnemliKurum): AdminOnemliKurum {
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
