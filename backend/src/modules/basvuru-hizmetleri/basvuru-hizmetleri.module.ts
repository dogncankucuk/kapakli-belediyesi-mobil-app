import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  BasvuruHizmeti,
  BasvuruHizmetiSchema,
} from './schemas/basvuru-hizmeti.schema';
import { AdminBasvuruHizmetleriController } from './admin-basvuru-hizmetleri.controller';
import { AdminBasvuruHizmetleriService } from './admin-basvuru-hizmetleri.service';
import { BasvuruHizmetleriController } from './basvuru-hizmetleri.controller';
import { BasvuruHizmetleriService } from './basvuru-hizmetleri.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BasvuruHizmeti.name, schema: BasvuruHizmetiSchema },
    ]),
  ],
  controllers: [BasvuruHizmetleriController, AdminBasvuruHizmetleriController],
  providers: [BasvuruHizmetleriService, AdminBasvuruHizmetleriService],
  exports: [MongooseModule],
})
export class BasvuruHizmetleriModule {}
