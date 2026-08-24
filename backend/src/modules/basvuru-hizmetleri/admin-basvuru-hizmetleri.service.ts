import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateBasvuruHizmetiDto } from './dto/create-basvuru-hizmeti.dto';
import { UpdateBasvuruHizmetiDto } from './dto/update-basvuru-hizmeti.dto';
import {
  BasvuruHizmeti,
  BasvuruHizmetiDocument,
} from './schemas/basvuru-hizmeti.schema';

export interface AdminBasvuruHizmeti {
  id: string;
  baslik: string;
  ozet: string;
  hizmetler: string[];
  kosullar: string[];
  calismaSaatleri: string | null;
  sorumluBirim: string | null;
  basvuruTuru: string;
  basvuruDegeri: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedBasvuruHizmeti = BasvuruHizmetiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminBasvuruHizmetleriService {
  constructor(
    @InjectModel(BasvuruHizmeti.name)
    private readonly basvuruHizmetiModel: Model<BasvuruHizmetiDocument>,
  ) {}

  async findAll(): Promise<AdminBasvuruHizmeti[]> {
    const hizmetler = await this.basvuruHizmetiModel
      .find()
      .sort({ baslik: 1 })
      .exec();
    return hizmetler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedBasvuruHizmeti),
    );
  }

  async findOne(id: string): Promise<AdminBasvuruHizmeti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.basvuruHizmetiModel.findById(id).exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedBasvuruHizmeti)
      : null;
  }

  async create(
    dto: CreateBasvuruHizmetiDto,
    updatedBy: string,
  ): Promise<AdminBasvuruHizmeti> {
    const created = (await this.basvuruHizmetiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedBasvuruHizmeti;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateBasvuruHizmetiDto,
    updatedBy: string,
  ): Promise<AdminBasvuruHizmeti | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.basvuruHizmetiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedBasvuruHizmeti)
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.basvuruHizmetiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedBasvuruHizmeti): AdminBasvuruHizmeti {
    return {
      id: doc._id.toString(),
      baslik: doc.baslik,
      ozet: doc.ozet,
      hizmetler: doc.hizmetler,
      kosullar: doc.kosullar,
      calismaSaatleri: doc.calismaSaatleri ?? null,
      sorumluBirim: doc.sorumluBirim ?? null,
      basvuruTuru: doc.basvuruTuru,
      basvuruDegeri: doc.basvuruDegeri,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
