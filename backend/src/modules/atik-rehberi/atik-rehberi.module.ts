import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  AtikRehberiIcerik,
  AtikRehberiIcerikSchema,
} from './schemas/atik-rehberi-icerik.schema';
import { AdminAtikRehberiController } from './admin-atik-rehberi.controller';
import { AdminAtikRehberiService } from './admin-atik-rehberi.service';
import { AtikRehberiController } from './atik-rehberi.controller';
import { AtikRehberiService } from './atik-rehberi.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AtikRehberiIcerik.name, schema: AtikRehberiIcerikSchema },
    ]),
  ],
  controllers: [AtikRehberiController, AdminAtikRehberiController],
  providers: [AtikRehberiService, AdminAtikRehberiService],
  exports: [MongooseModule],
})
export class AtikRehberiModule {}
