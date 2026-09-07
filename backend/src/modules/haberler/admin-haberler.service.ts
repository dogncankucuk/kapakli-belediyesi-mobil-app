import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { CreateHaberDto } from './dto/create-haber.dto';
import { UpdateHaberDto } from './dto/update-haber.dto';
import { Haber, HaberDocument } from './schemas/haber.schema';

export interface AdminHaber {
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

type TimestampedHaber = HaberDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminHaberlerService {
  constructor(
    @InjectModel(Haber.name)
    private readonly haberModel: Model<HaberDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<AdminHaber[]> {
    const haberler = await this.haberModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return haberler.map((doc) => this.toAdmin(doc as unknown as TimestampedHaber));
  }

  async findOne(id: string): Promise<AdminHaber | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.haberModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedHaber) : null;
  }

  async create(dto: CreateHaberDto, updatedBy: string): Promise<AdminHaber> {
    const created = (await this.haberModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedHaber;

    await this.notificationsService.sendBroadcast(
      'guncel',
      created.baslik,
      'Yeni içerik yayınlandı, incelemek için uygulamayı açın.',
    );

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateHaberDto,
    updatedBy: string,
  ): Promise<AdminHaber | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.haberModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedHaber) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.haberModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedHaber): AdminHaber {
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
