import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreatePlanliKesintiDto } from './dto/create-planli-kesinti.dto';
import { UpdatePlanliKesintiDto } from './dto/update-planli-kesinti.dto';
import {
  PlanliKesinti,
  PlanliKesintiDocument,
} from './schemas/planli-kesinti.schema';

export interface AdminPlanliKesinti {
  id: string;
  tarih: string;
  ilce: string;
  aciklama: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedPlanliKesinti = PlanliKesintiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminPlanliKesintilerService {
  constructor(
    @InjectModel(PlanliKesinti.name)
    private readonly planliKesintiModel: Model<PlanliKesintiDocument>,
  ) {}

  async findAll(): Promise<AdminPlanliKesinti[]> {
    const kesintiler = await this.planliKesintiModel
      .find()
      .sort({ tarih: -1 })
      .exec();
    return kesintiler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedPlanliKesinti),
    );
  }

  async findOne(id: string): Promise<AdminPlanliKesinti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.planliKesintiModel.findById(id).exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedPlanliKesinti)
      : null;
  }

  async create(
    dto: CreatePlanliKesintiDto,
    updatedBy: string,
  ): Promise<AdminPlanliKesinti> {
    const created = (await this.planliKesintiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedPlanliKesinti;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdatePlanliKesintiDto,
    updatedBy: string,
  ): Promise<AdminPlanliKesinti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.planliKesintiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedPlanliKesinti)
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.planliKesintiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedPlanliKesinti): AdminPlanliKesinti {
    return {
      id: doc._id.toString(),
      tarih: doc.tarih.toISOString(),
      ilce: doc.ilce,
      aciklama: doc.aciklama,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
