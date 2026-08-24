import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateFaturaOdemeKurumuDto } from './dto/create-fatura-odeme-kurumu.dto';
import { UpdateFaturaOdemeKurumuDto } from './dto/update-fatura-odeme-kurumu.dto';
import {
  FaturaOdemeKurumu,
  FaturaOdemeKurumuDocument,
} from './schemas/fatura-odeme-kurumu.schema';

export interface AdminFaturaOdemeKurumu {
  id: string;
  ad: string;
  aciklama: string;
  url: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedKurum = FaturaOdemeKurumuDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminFaturaOdemeService {
  constructor(
    @InjectModel(FaturaOdemeKurumu.name)
    private readonly kurumModel: Model<FaturaOdemeKurumuDocument>,
  ) {}

  async findAll(): Promise<AdminFaturaOdemeKurumu[]> {
    const kurumlar = await this.kurumModel.find().sort({ createdAt: 1 }).exec();
    return kurumlar.map((doc) => this.toAdmin(doc as unknown as TimestampedKurum));
  }

  async findOne(id: string): Promise<AdminFaturaOdemeKurumu | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.kurumModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedKurum) : null;
  }

  async create(
    dto: CreateFaturaOdemeKurumuDto,
    updatedBy: string,
  ): Promise<AdminFaturaOdemeKurumu> {
    const created = (await this.kurumModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedKurum;
    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateFaturaOdemeKurumuDto,
    updatedBy: string,
  ): Promise<AdminFaturaOdemeKurumu | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.kurumModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedKurum) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.kurumModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedKurum): AdminFaturaOdemeKurumu {
    return {
      id: doc._id.toString(),
      ad: doc.ad,
      aciklama: doc.aciklama,
      url: doc.url,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
