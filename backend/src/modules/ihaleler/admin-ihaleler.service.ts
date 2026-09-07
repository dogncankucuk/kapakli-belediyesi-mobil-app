import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { CreateIhaleDto } from './dto/create-ihale.dto';
import { UpdateIhaleDto } from './dto/update-ihale.dto';
import { Ihale, IhaleDocument } from './schemas/ihale.schema';

export interface AdminIhale {
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

type TimestampedIhale = IhaleDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminIhalelerService {
  constructor(
    @InjectModel(Ihale.name)
    private readonly ihaleModel: Model<IhaleDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<AdminIhale[]> {
    const ihaleler = await this.ihaleModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return ihaleler.map((doc) => this.toAdmin(doc as unknown as TimestampedIhale));
  }

  async findOne(id: string): Promise<AdminIhale | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.ihaleModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedIhale) : null;
  }

  async create(dto: CreateIhaleDto, updatedBy: string): Promise<AdminIhale> {
    const created = (await this.ihaleModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedIhale;

    await this.notificationsService.sendBroadcast(
      'guncel',
      created.baslik,
      'Yeni içerik yayınlandı, incelemek için uygulamayı açın.',
    );

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateIhaleDto,
    updatedBy: string,
  ): Promise<AdminIhale | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.ihaleModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedIhale) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.ihaleModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedIhale): AdminIhale {
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
