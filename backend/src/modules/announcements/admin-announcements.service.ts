import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import {
  Announcement,
  AnnouncementDocument,
} from './schemas/announcement.schema';

export interface AdminAnnouncement {
  id: string;
  baslik: string;
  icerik: string;
  resimUrl: string | null;
  yayinTarihi: string;
  kategori: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

type TimestampedAnnouncement = AnnouncementDocument & {
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AdminAnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<AnnouncementDocument>,
  ) {}

  async findAll(): Promise<AdminAnnouncement[]> {
    const announcements = await this.announcementModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return announcements.map((doc) =>
      this.toAdmin(doc as unknown as TimestampedAnnouncement),
    );
  }

  async findOne(id: string): Promise<AdminAnnouncement | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.announcementModel.findById(id).exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAnnouncement) : null;
  }

  async create(
    dto: CreateAnnouncementDto,
    updatedBy: string,
  ): Promise<AdminAnnouncement> {
    const created = (await this.announcementModel.create({
      ...dto,
      updatedBy,
    })) as unknown as TimestampedAnnouncement;

    return this.toAdmin(created);
  }

  async update(
    id: string,
    dto: UpdateAnnouncementDto,
    updatedBy: string,
  ): Promise<AdminAnnouncement | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.announcementModel
      .findByIdAndUpdate(id, { ...dto, updatedBy }, { new: true })
      .exec();
    return doc ? this.toAdmin(doc as unknown as TimestampedAnnouncement) : null;
  }

  async remove(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.announcementModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toAdmin(doc: TimestampedAnnouncement): AdminAnnouncement {
    return {
      id: doc._id.toString(),
      baslik: doc.baslik,
      icerik: doc.icerik,
      resimUrl: doc.resimUrl ?? null,
      yayinTarihi: doc.yayinTarihi.toISOString(),
      kategori: doc.kategori,
      updatedBy: doc.updatedBy ?? null,
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
