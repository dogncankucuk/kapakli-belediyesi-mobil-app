import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  FaturaOdemeKurumu,
  FaturaOdemeKurumuSchema,
} from './schemas/fatura-odeme-kurumu.schema';
import { AdminFaturaOdemeController } from './admin-fatura-odeme.controller';
import { AdminFaturaOdemeService } from './admin-fatura-odeme.service';
import { FaturaOdemeController } from './fatura-odeme.controller';
import { FaturaOdemeService } from './fatura-odeme.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FaturaOdemeKurumu.name, schema: FaturaOdemeKurumuSchema },
    ]),
  ],
  controllers: [FaturaOdemeController, AdminFaturaOdemeController],
  providers: [FaturaOdemeService, AdminFaturaOdemeService],
  exports: [MongooseModule],
})
export class FaturaOdemeModule {}
