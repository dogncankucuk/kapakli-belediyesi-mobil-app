import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  Announcement,
  AnnouncementSchema,
} from './schemas/announcement.schema';
import { AdminAnnouncementsController } from './admin-announcements.controller';
import { AdminAnnouncementsService } from './admin-announcements.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { KapakliWebAnnouncementsService } from './kapakli-web-announcements.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
  ],
  controllers: [AnnouncementsController, AdminAnnouncementsController],
  providers: [
    AnnouncementsService,
    AdminAnnouncementsService,
    KapakliWebAnnouncementsService,
  ],
  exports: [MongooseModule],
})
export class AnnouncementsModule {}
