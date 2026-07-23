import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateBarajDto } from './dto/create-baraj.dto';
import { UpdateBarajDto } from './dto/update-baraj.dto';
import { Baraj, BarajDocument } from './schemas/baraj.schema';

export interface AdminBaraj {
  id: string;
  ad: string;
  doluluk: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedBaraj = BarajDocument & { createdAt: Date; updatedAt: Date };

@Injectable()
export class AdminBarajlarService {
  constructor(
    @InjectModel(Baraj.name)
    private readonly barajModel: Model<BarajDocument>,
  ) {}

  async findAll(): Promise<AdminBaraj[]> {
    const barajlar = await this.barajModel.find().sort({ ad: 1 }).exec();
    return barajlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedBaraj),
    );
  }

  async findOne(id: string): Promise<AdminBaraj | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.barajModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedBaraj) : null;
  }

  async create(dto: CreateBarajDto, updatedBy: string): Promise<AdminBaraj> {
    const created = (await this.barajModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedBaraj;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateBarajDto,
    updatedBy: string,
  ): Promise<AdminBaraj | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.barajModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedBaraj) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.barajModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedBaraj): AdminBaraj {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      doluluk: doc.doluluk,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
