import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import {
  MeclisGundemi,
  MeclisGundemiSchema,
} from './schemas/meclis-gundemi.schema';
import { AdminMeclisGundemleriController } from './admin-meclis-gundemleri.controller';
import { AdminMeclisGundemleriService } from './admin-meclis-gundemleri.service';
import { MeclisGundemleriController } from './meclis-gundemleri.controller';
import { MeclisGundemleriService } from './meclis-gundemleri.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MeclisGundemi.name, schema: MeclisGundemiSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [MeclisGundemleriController, AdminMeclisGundemleriController],
  providers: [MeclisGundemleriService, AdminMeclisGundemleriService],
  exports: [MongooseModule],
})
export class MeclisGundemleriModule {}
