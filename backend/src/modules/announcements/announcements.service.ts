import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Announcement,
  AnnouncementDocument,
} from './schemas/announcement.schema';

export interface PublicAnnouncement {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
  kategori: string;
}

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<AnnouncementDocument>,
  ) {}

  async findAll(): Promise<PublicAnnouncement[]> {
    const announcements = await this.announcementModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return announcements.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      icerik: doc.icerik,
      resimUrlleri: doc.resimUrlleri ?? [],
      dosyaUrlleri: doc.dosyaUrlleri ?? [],
      youtubeUrl: doc.youtubeUrl ?? null,
      yayinTarihi: doc.yayinTarihi.toISOString(),
      kategori: doc.kategori,
    }));
  }
}
