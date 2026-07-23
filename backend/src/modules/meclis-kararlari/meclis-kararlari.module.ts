import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  MeclisKarari,
  MeclisKarariSchema,
} from './schemas/meclis-karari.schema';
import { AdminMeclisKararlariController } from './admin-meclis-kararlari.controller';
import { AdminMeclisKararlariService } from './admin-meclis-kararlari.service';
import { MeclisKararlariController } from './meclis-kararlari.controller';
import { MeclisKararlariService } from './meclis-kararlari.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MeclisKarari.name, schema: MeclisKarariSchema },
    ]),
  ],
  controllers: [MeclisKararlariController, AdminMeclisKararlariController],
  providers: [MeclisKararlariService, AdminMeclisKararlariService],
  exports: [MongooseModule],
})
export class MeclisKararlariModule {}
