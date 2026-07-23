import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateCamiDto } from './dto/create-cami.dto';
import { UpdateCamiDto } from './dto/update-cami.dto';
import { Cami, CamiDocument } from './schemas/cami.schema';

export interface AdminCami {
  id: string;
  ad: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedCami = CamiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminCamilerService {
  constructor(
    @InjectModel(Cami.name)
    private readonly camiModel: Model<CamiDocument>,
  ) {}

  async findAll(): Promise<AdminCami[]> {
    const camiler = await this.camiModel.find().sort({ ad: 1 }).exec();
    return camiler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedCami),
    );
  }

  async findOne(id: string): Promise<AdminCami | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.camiModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedCami) : null;
  }

  async create(dto: CreateCamiDto, updatedBy: string): Promise<AdminCami> {
    const created = (await this.camiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedCami;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateCamiDto,
    updatedBy: string,
  ): Promise<AdminCami | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.camiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedCami) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.camiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedCami): AdminCami {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      adres: doc.adres ?? null,
      lat: doc.lat,
      lng: doc.lng,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
