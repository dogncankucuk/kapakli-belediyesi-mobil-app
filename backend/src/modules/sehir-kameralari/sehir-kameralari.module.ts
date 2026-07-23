import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  SehirKamerasi,
  SehirKamerasiSchema,
} from './schemas/sehir-kamerasi.schema';
import { AdminSehirKameralariController } from './admin-sehir-kameralari.controller';
import { AdminSehirKameralariService } from './admin-sehir-kameralari.service';
import { SehirKameralariController } from './sehir-kameralari.controller';
import { SehirKameralariService } from './sehir-kameralari.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SehirKamerasi.name, schema: SehirKamerasiSchema },
    ]),
  ],
  controllers: [SehirKameralariController, AdminSehirKameralariController],
  providers: [SehirKameralariService, AdminSehirKameralariService],
  exports: [MongooseModule],
})
export class SehirKameralariModule {}
