import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UlasimHatti, UlasimHattiSchema } from './schemas/ulasim-hatti.schema';
import { AdminUlasimHatlariController } from './admin-ulasim-hatlari.controller';
import { AdminUlasimHatlariService } from './admin-ulasim-hatlari.service';
import { UlasimHatlariController } from './ulasim-hatlari.controller';
import { UlasimHatlariService } from './ulasim-hatlari.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UlasimHatti.name, schema: UlasimHattiSchema },
    ]),
  ],
  controllers: [UlasimHatlariController, AdminUlasimHatlariController],
  providers: [UlasimHatlariService, AdminUlasimHatlariService],
  exports: [MongooseModule],
})
export class UlasimHatlariModule {}
