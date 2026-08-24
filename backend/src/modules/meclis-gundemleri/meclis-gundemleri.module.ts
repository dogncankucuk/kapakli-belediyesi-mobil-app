import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

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
  ],
  controllers: [MeclisGundemleriController, AdminMeclisGundemleriController],
  providers: [MeclisGundemleriService, AdminMeclisGundemleriService],
  exports: [MongooseModule],
})
export class MeclisGundemleriModule {}
