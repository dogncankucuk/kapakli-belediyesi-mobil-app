import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  UlasimSecenegi,
  UlasimSecenegiSchema,
} from './schemas/ulasim-secenegi.schema';
import { AdminUlasimHizmetleriController } from './admin-ulasim-hizmetleri.controller';
import { AdminUlasimHizmetleriService } from './admin-ulasim-hizmetleri.service';
import { UlasimHizmetleriController } from './ulasim-hizmetleri.controller';
import { UlasimHizmetleriService } from './ulasim-hizmetleri.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UlasimSecenegi.name, schema: UlasimSecenegiSchema },
    ]),
  ],
  controllers: [UlasimHizmetleriController, AdminUlasimHizmetleriController],
  providers: [UlasimHizmetleriService, AdminUlasimHizmetleriService],
  exports: [MongooseModule],
})
export class UlasimHizmetleriModule {}
