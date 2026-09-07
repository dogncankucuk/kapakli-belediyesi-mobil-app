import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { CreateElektrikKesintisiDto } from './dto/create-elektrik-kesintisi.dto';
import { UpdateElektrikKesintisiDto } from './dto/update-elektrik-kesintisi.dto';
import {
  ElektrikKesintisi,
  ElektrikKesintisiDocument,
} from './schemas/elektrik-kesintisi.schema';

export interface AdminElektrikKesintisi {
  id: string;
  mahalle: string;
  tarih: string;
  aciklama: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedElektrikKesintisi = ElektrikKesintisiDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminElektrikKesintisiService {
  constructor(
    @InjectModel(ElektrikKesintisi.name)
    private readonly elektrikKesintisiModel: Model<ElektrikKesintisiDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<AdminElektrikKesintisi[]> {
    const kesintiler = await this.elektrikKesintisiModel
      .find()
      .sort({ tarih: -1 })
      .exec();
    return kesintiler.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedElektrikKesintisi),
    );
  }

  async findOne(id: string): Promise<AdminElektrikKesintisi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.elektrikKesintisiModel.findById(id).exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedElektrikKesintisi)
      : null;
  }

  async create(
    dto: CreateElektrikKesintisiDto,
    updatedBy: string,
  ): Promise<AdminElektrikKesintisi> {
    const created = (await this.elektrikKesintisiModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedElektrikKesintisi;

    await this.notificationsService.sendToMahalle(
      dto.mahalle,
      'elektrikKesintisi',
      'Planlı Elektrik Kesintisi',
      'Bölgenizde planlı bir elektrik kesintisi var, detaylar için uygulamayı açın.',
      'elektrikKesintisi',
      created.id,
    );

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateElektrikKesintisiDto,
    updatedBy: string,
  ): Promise<AdminElektrikKesintisi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.elektrikKesintisiModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedElektrikKesintisi)
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.elektrikKesintisiModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(
    doc: TimestampedElektrikKesintisi,
  ): AdminElektrikKesintisi {
    return {
      id: doc._id.toString(),
      mahalle: doc.mahalle,
      tarih: doc.tarih.toISOString(),
      aciklama: doc.aciklama,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
