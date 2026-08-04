import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  Announcement,
  AnnouncementDocument,
} from './schemas/announcement.schema';
import { KapakliWebAnnouncementsService } from './kapakli-web-announcements.service';

export interface PublicAnnouncement {
  id: string;
  baslik: string;
  icerik: string;
  resimUrl: string | null;
  yayinTarihi: string;
  kategori: string;
}

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectModel(Announcement.name)
    private readonly announcementModel: Model<AnnouncementDocument>,
    private readonly kapakliWebAnnouncementsService: KapakliWebAnnouncementsService,
  ) {}

  async findAll(): Promise<PublicAnnouncement[]> {
    const [dbItems, webItems] = await Promise.all([
      this.findAllFromDb(),
      this.kapakliWebAnnouncementsService.findAll(),
    ]);

    return [...dbItems, ...webItems].sort(
      (a, b) =>
        new Date(b.yayinTarihi).getTime() - new Date(a.yayinTarihi).getTime(),
    );
  }

  private async findAllFromDb(): Promise<PublicAnnouncement[]> {
    const announcements = await this.announcementModel
      .find()
      .sort({ yayinTarihi: -1 })
      .exec();

    return announcements.map((doc) => ({
      id: doc._id.toString(),
      baslik: doc.baslik,
      icerik: doc.icerik,
      resimUrl: doc.resimUrl ?? null,
      yayinTarihi: doc.yayinTarihi.toISOString(),
      kategori: doc.kategori,
    }));
  }
}
