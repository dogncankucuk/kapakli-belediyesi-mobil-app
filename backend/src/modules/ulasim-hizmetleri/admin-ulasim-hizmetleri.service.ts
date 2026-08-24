import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateUlasimSecenegiDto } from './dto/create-ulasim-secenegi.dto';
import { UpdateUlasimSecenegiDto } from './dto/update-ulasim-secenegi.dto';
import {
  UlasimSecenegi,
  UlasimSecenegiDocument,
} from './schemas/ulasim-secenegi.schema';

export interface AdminUlasimSecenegi {
  id: string;
  baslik: string;
  aciklama: string;
  url: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedSecenek = UlasimSecenegiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminUlasimHizmetleriService {
  constructor(
    @InjectModel(UlasimSecenegi.name)
    private readonly secenekModel: Model<UlasimSecenegiDocument>,
  ) {}

  async findAll(): Promise<AdminUlasimSecenegi[]> {
    const secenekler = await this.secenekModel
      .find()
      .sort({ createdAt: 1 })
      .exec();
    return secenekler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedSecenek),
    );
  }

  async findOne(id: string): Promise<AdminUlasimSecenegi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.secenekModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedSecenek) : null;
  }

  async create(
    dto: CreateUlasimSecenegiDto,
    updatedBy: string,
  ): Promise<AdminUlasimSecenegi> {
    const created = (await this.secenekModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedSecenek;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateUlasimSecenegiDto,
    updatedBy: string,
  ): Promise<AdminUlasimSecenegi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.secenekModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedSecenek) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.secenekModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedSecenek): AdminUlasimSecenegi {
    return {
      id: doc._id.toString(),
      baslik: doc.baslik,
      aciklama: doc.aciklama,
      url: doc.url,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
