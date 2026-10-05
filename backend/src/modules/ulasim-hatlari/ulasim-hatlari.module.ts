import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { KesintiApiAyarlariModule } from '../kesinti-api-ayarlari/kesinti-api-ayarlari.module';
import { UlasimHatti, UlasimHattiSchema } from './schemas/ulasim-hatti.schema';
import { AdminUlasimHatlariController } from './admin-ulasim-hatlari.controller';
import { AdminUlasimHatlariService } from './admin-ulasim-hatlari.service';
import { TekulasCanliTakipService } from './tekulas-canli-takip.service';
import { UlasimHatlariController } from './ulasim-hatlari.controller';
import { UlasimHatlariService } from './ulasim-hatlari.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UlasimHatti.name, schema: UlasimHattiSchema },
    ]),
    KesintiApiAyarlariModule,
  ],
  controllers: [UlasimHatlariController, AdminUlasimHatlariController],
  providers: [
    UlasimHatlariService,
    AdminUlasimHatlariService,
    TekulasCanliTakipService,
  ],
  exports: [MongooseModule],
})
export class UlasimHatlariModule {}
