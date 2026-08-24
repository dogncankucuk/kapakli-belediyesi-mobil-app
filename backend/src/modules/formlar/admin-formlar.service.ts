import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateFormBelgesiDto } from './dto/create-form-belgesi.dto';
import { UpdateFormBelgesiDto } from './dto/update-form-belgesi.dto';
import {
  FormBelgesi,
  FormBelgesiDocument,
} from './schemas/form-belgesi.schema';

export interface AdminFormBelgesi {
  id: string;
  baslik: string;
  url: string;
  tur: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedFormBelgesi = FormBelgesiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminFormlarService {
  constructor(
    @InjectModel(FormBelgesi.name)
    private readonly formBelgesiModel: Model<FormBelgesiDocument>,
  ) {}

  async findAll(): Promise<AdminFormBelgesi[]> {
    const formlar = await this.formBelgesiModel
      .find()
      .sort({ tur: 1, baslik: 1 })
      .exec();
    return formlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedFormBelgesi),
    );
  }

  async findOne(id: string): Promise<AdminFormBelgesi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.formBelgesiModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedFormBelgesi) : null;
  }

  async create(
    dto: CreateFormBelgesiDto,
    updatedBy: string,
  ): Promise<AdminFormBelgesi> {
    const created = (await this.formBelgesiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedFormBelgesi;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateFormBelgesiDto,
    updatedBy: string,
  ): Promise<AdminFormBelgesi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.formBelgesiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedFormBelgesi) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.formBelgesiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedFormBelgesi): AdminFormBelgesi {
    return {
      id: doc._id.toString(),
      baslik: doc.baslik,
      url: doc.url,
      tur: doc.tur,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
