import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { CreateIlanDto } from './dto/create-ilan.dto';
import { UpdateIlanDto } from './dto/update-ilan.dto';
import { Ilan, IlanDocument } from './schemas/ilan.schema';

export interface AdminIlan {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedIlan = IlanDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminIlanlarService {
  constructor(
    @InjectModel(Ilan.name)
    private readonly ilanModel: Model<IlanDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<AdminIlan[]> {
    const ilanlar = await this.ilanModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return ilanlar.map((doc) => this.toAdmin(doc as unknown as TimestampedIlan));
  }

  async findOne(id: string): Promise<AdminIlan | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.ilanModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedIlan) : null;
  }

  async create(dto: CreateIlanDto, updatedBy: string): Promise<AdminIlan> {
    const created = (await this.ilanModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedIlan;

    await this.notificationsService.sendBroadcast(
      'guncel',
      created.baslik,
      'Yeni içerik yayınlandı, incelemek için uygulamayı açın.',
    );

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateIlanDto,
    updatedBy: string,
  ): Promise<AdminIlan | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.ilanModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedIlan) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.ilanModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedIlan): AdminIlan {
    return {
      id: doc._id.toString(),
      baslik: doc.baslik,
      icerik: doc.icerik,
      resimUrlleri: doc.resimUrlleri ?? [],
      dosyaUrlleri: doc.dosyaUrlleri ?? [],
      youtubeUrl: doc.youtubeUrl ?? null,
      yayinTarihi: doc.yayinTarihi.toISOString(),
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
