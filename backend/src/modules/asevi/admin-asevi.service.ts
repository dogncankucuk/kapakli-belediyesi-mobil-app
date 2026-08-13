import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { UpdateAseviBasvuruDto } from './dto/update-asevi-basvuru.dto';
import {
  AseviBasvuru,
  AseviBasvuruDocument,
  AseviBasvuruDurumu,
} from './schemas/asevi-basvuru.schema';

export interface AdminAseviBasvuru {
  id: string;
  adSoyad: string;
  telefon: string;
  adres: string;
  durum: AseviBasvuruDurumu;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedAseviBasvuru = AseviBasvuruDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminAseviService {
  constructor(
    @InjectModel(AseviBasvuru.name)
    private readonly aseviBasvuruModel: Model<AseviBasvuruDocument>,
  ) {}

  async findAll(): Promise<AdminAseviBasvuru[]> {
    const basvurular = await this.aseviBasvuruModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
    return basvurular.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedAseviBasvuru),
    );
  }

  async findOne(id: string): Promise<AdminAseviBasvuru | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.aseviBasvuruModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAseviBasvuru) : null;
  }

  async update(
    id: string,
    dto: UpdateAseviBasvuruDto,
    updatedBy: string,
  ): Promise<AdminAseviBasvuru | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.aseviBasvuruModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAseviBasvuru) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.aseviBasvuruModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedAseviBasvuru): AdminAseviBasvuru {
    return {
      id: doc._id.toString(),
      adSoyad: doc.adSoyad,
      telefon: doc.telefon,
      adres: doc.adres,
      durum: doc.durum,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
