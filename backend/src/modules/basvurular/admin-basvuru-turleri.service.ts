import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateBasvuruTuruDto } from './dto/create-basvuru-turu.dto';
import { UpdateBasvuruTuruDto } from './dto/update-basvuru-turu.dto';
import {
  BasvuruTuru,
  BasvuruTuruDocument,
  EkBilgiAlani,
  GerekliBelge,
} from './schemas/basvuru-turu.schema';

export interface AdminBasvuruTuru {
  id: string;
  baslik: string;
  aciklama: string | null;
  aktif: boolean;
  ekBilgiAlanlari: EkBilgiAlani[];
  gerekliBelgeler: GerekliBelge[];
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedBasvuruTuru = BasvuruTuruDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminBasvuruTurleriService {
  constructor(
    @InjectModel(BasvuruTuru.name)
    private readonly basvuruTuruModel: Model<BasvuruTuruDocument>,
  ) {}

  async findAll(): Promise<AdminBasvuruTuru[]> {
    const turler = await this.basvuruTuruModel
      .find()
      .sort({ baslik: 1 })
      .exec();
    return turler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedBasvuruTuru),
    );
  }

  async findOne(id: string): Promise<AdminBasvuruTuru | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.basvuruTuruModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedBasvuruTuru) : null;
  }

  async create(
    dto: CreateBasvuruTuruDto,
    updatedBy: string,
  ): Promise<AdminBasvuruTuru> {
    const created = (await this.basvuruTuruModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedBasvuruTuru;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateBasvuruTuruDto,
    updatedBy: string,
  ): Promise<AdminBasvuruTuru | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.basvuruTuruModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedBasvuruTuru) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.basvuruTuruModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedBasvuruTuru): AdminBasvuruTuru {
    return {
      id: doc._id.toString(),
      baslik: doc.baslik,
      aciklama: doc.aciklama ?? null,
      aktif: doc.aktif,
      ekBilgiAlanlari: doc.ekBilgiAlanlari ?? [],
      gerekliBelgeler: doc.gerekliBelgeler ?? [],
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
