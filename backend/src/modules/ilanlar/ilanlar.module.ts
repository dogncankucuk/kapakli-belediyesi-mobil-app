import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Ilan, IlanSchema } from './schemas/ilan.schema';
import { AdminIlanlarController } from './admin-ilanlar.controller';
import { AdminIlanlarService } from './admin-ilanlar.service';
import { IlanlarController } from './ilanlar.controller';
import { IlanlarService } from './ilanlar.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ilan.name, schema: IlanSchema }]),
  ],
  controllers: [IlanlarController, AdminIlanlarController],
  providers: [IlanlarService, AdminIlanlarService],
  exports: [MongooseModule],
})
export class IlanlarModule {}
