import { Controller, Get } from '@nestjs/common';

import {
  AnnouncementsService,
  PublicAnnouncement,
} from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  findAll(): Promise<PublicAnnouncement[]> {
    return this.announcementsService.findAll();
  }
}
