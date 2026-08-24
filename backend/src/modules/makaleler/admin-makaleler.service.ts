import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateMakaleDto } from './dto/create-makale.dto';
import { UpdateMakaleDto } from './dto/update-makale.dto';
import { Makale, MakaleDocument } from './schemas/makale.schema';

export interface AdminMakale {
  id: string;
  baslik: string;
  icerik: string;
  resimUrl: string | null;
  yayinTarihi: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedMakale = MakaleDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminMakalelerService {
  constructor(
    @InjectModel(Makale.name)
    private readonly makaleModel: Model<MakaleDocument>,
  ) {}

  async findAll(): Promise<AdminMakale[]> {
    const makaleler = await this.makaleModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return makaleler.map((doc) => this.toAdmin(doc as unknown as TimestampedMakale));
  }

  async findOne(id: string): Promise<AdminMakale | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.makaleModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedMakale) : null;
  }

  async create(dto: CreateMakaleDto, updatedBy: string): Promise<AdminMakale> {
    const created = (await this.makaleModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedMakale;

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateMakaleDto,
    updatedBy: string,
  ): Promise<AdminMakale | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.makaleModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedMakale) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.makaleModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedMakale): AdminMakale {
    return {
      id: doc._id.toString(),
      baslik: doc.baslik,
      icerik: doc.icerik,
      resimUrl: doc.resimUrl ?? null,
      yayinTarihi: doc.yayinTarihi.toISOString(),
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
