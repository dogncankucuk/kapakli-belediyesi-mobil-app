import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminKesintiApiAyarlariController } from './admin-kesinti-api-ayarlari.controller';
import { KesintiApiAyarlariService } from './kesinti-api-ayarlari.service';
import {
  KesintiApiAyari,
  KesintiApiAyariSchema,
} from './schemas/kesinti-api-ayari.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KesintiApiAyari.name, schema: KesintiApiAyariSchema },
    ]),
  ],
  controllers: [AdminKesintiApiAyarlariController],
  providers: [KesintiApiAyarlariService],
  exports: [KesintiApiAyarlariService],
})
export class KesintiApiAyarlariModule {}
