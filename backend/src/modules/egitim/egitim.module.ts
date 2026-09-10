import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CbsModule } from '../cbs/cbs.module';
import {
  EgitimKurumu,
  EgitimKurumuSchema,
} from './schemas/egitim-kurumu.schema';
import { AdminEgitimController } from './admin-egitim.controller';
import { AdminEgitimService } from './admin-egitim.service';
import { EgitimController } from './egitim.controller';
import { EgitimService } from './egitim.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EgitimKurumu.name, schema: EgitimKurumuSchema },
    ]),
    CbsModule,
  ],
  controllers: [EgitimController, AdminEgitimController],
  providers: [EgitimService, AdminEgitimService],
  exports: [MongooseModule],
})
export class EgitimModule {}
