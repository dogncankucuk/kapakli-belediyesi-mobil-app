import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CbsModule } from '../cbs/cbs.module';
import { PharmaciesModule } from '../pharmacies/pharmacies.module';
import {
  SaglikKurumu,
  SaglikKurumuSchema,
} from './schemas/saglik-kurumu.schema';
import { AdminSaglikController } from './admin-saglik.controller';
import { AdminSaglikService } from './admin-saglik.service';
import { SaglikController } from './saglik.controller';
import { SaglikService } from './saglik.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SaglikKurumu.name, schema: SaglikKurumuSchema },
    ]),
    CbsModule,
    PharmaciesModule,
  ],
  controllers: [SaglikController, AdminSaglikController],
  providers: [SaglikService, AdminSaglikService],
  exports: [MongooseModule],
})
export class SaglikModule {}
