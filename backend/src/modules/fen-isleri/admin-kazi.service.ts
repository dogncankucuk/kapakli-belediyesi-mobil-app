import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { CreateKaziDto } from './dto/create-kazi.dto';
import { UpdateKaziDto } from './dto/update-kazi.dto';
import { Kazi, KaziDocument } from './schemas/kazi.schema';

export interface AdminKazi {
  id: string;
  mahalle: string;
  baslangicTarihi: string;
  sureGun: number;
  saat: string;
  aciklama: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedKazi = KaziDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminKaziService {
  constructor(
    @InjectModel(Kazi.name)
    private readonly kaziModel: Model<KaziDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<AdminKazi[]> {
    const kazilar = await this.kaziModel
      .find()
      .sort({ baslangicTarihi: -1 })
      .exec();
    return kazilar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedKazi),
    );
  }

  async findOne(id: string): Promise<AdminKazi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.kaziModel.findById(id).exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedKazi)
      : null;
  }

  async create(dto: CreateKaziDto, updatedBy: string): Promise<AdminKazi> {
    const created = (await this.kaziModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedKazi;

    await this.notificationsService.sendToMahalle(
      dto.mahalle,
      'kaziCalismasi',
      'Kazı Çalışması Bildirimi',
      'Bölgenizde bir kazı çalışması planlandı, detaylar için uygulamayı açın.',
      'kaziCalismasi',
      created.id,
    );

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateKaziDto,
    updatedBy: string,
  ): Promise<AdminKazi | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.kaziModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc
      ? this.toAdmin(doc as unknown as TimestampedKazi)
      : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.kaziModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedKazi): AdminKazi {
    return {
      id: doc._id.toString(),
      mahalle: doc.mahalle,
      baslangicTarihi: doc.baslangicTarihi.toISOString(),
      sureGun: doc.sureGun,
      saat: doc.saat,
      aciklama: doc.aciklama,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
