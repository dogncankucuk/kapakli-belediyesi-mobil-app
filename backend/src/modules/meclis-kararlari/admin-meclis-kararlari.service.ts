import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { NotificationsService } from '../notifications/notifications.service';
import { zenginMetinTemizle } from '../../zengin-metin-sanitize';
import { CreateMeclisKarariDto } from './dto/create-meclis-karari.dto';
import { UpdateMeclisKarariDto } from './dto/update-meclis-karari.dto';
import {
  MeclisKarari,
  MeclisKarariDocument,
} from './schemas/meclis-karari.schema';

export interface AdminMeclisKarari {
  id: string;
  kararNo: string;
  kategori: string;
  tarih: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedMeclisKarari = MeclisKarariDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminMeclisKararlariService {
  private readonly logger = new Logger(AdminMeclisKararlariService.name);

  constructor(
    @InjectModel(MeclisKarari.name)
    private readonly meclisKarariModel: Model<MeclisKarariDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<AdminMeclisKarari[]> {
    const kararlar = await this.meclisKarariModel
      .find()
      .sort({ tarih: -1 })
      .exec();
    return kararlar.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedMeclisKarari),
    );
  }

  async findOne(id: string): Promise<AdminMeclisKarari | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.meclisKarariModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedMeclisKarari) : null;
  }

  async create(
    dto: CreateMeclisKarariDto,
    updatedBy: string,
  ): Promise<AdminMeclisKarari> {
    const created = (await this.meclisKarariModel.create({
      ...dto,
      ...(dto.icerik !== undefined && { icerik: zenginMetinTemizle(dto.icerik) }),
      updatedBy,
    })) as unknown as TimestampedMeclisKarari;

    // 1000+ kullaniciyla senkron await dakikalarca surup istegi timeout'a
    // dusurebilir - admin tekrar dener, icerik iki kez olusur. Fire-and-forget.
    void this.notificationsService
      .sendBroadcast(
        'guncel',
        created.baslik,
        'Yeni içerik yayınlandı, incelemek için uygulamayı açın.',
      )
      .catch((err) => this.logger.error('Broadcast basarisiz', err));

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateMeclisKarariDto,
    updatedBy: string,
  ): Promise<AdminMeclisKarari | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const doc = await this.meclisKarariModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          ...(dto.icerik !== undefined && { icerik: zenginMetinTemizle(dto.icerik) }),
          updatedBy,
        },
        { new: true },
      )
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedMeclisKarari) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const res = await this.meclisKarariModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  private toAdmin(doc: TimestampedMeclisKarari): AdminMeclisKarari {
    return {
      id: doc._id.toString(),
      kararNo: doc.kararNo,
      kategori: doc.kategori,
      tarih: doc.tarih.toISOString(),
      baslik: doc.baslik,
      icerik: doc.icerik ?? '',
      resimUrlleri: doc.resimUrlleri ?? [],
      dosyaUrlleri: doc.dosyaUrlleri ?? [],
      youtubeUrl: doc.youtubeUrl ?? null,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
