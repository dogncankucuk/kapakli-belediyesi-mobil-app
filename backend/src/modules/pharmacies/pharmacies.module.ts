import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { KesintiApiAyarlariModule } from '../kesinti-api-ayarlari/kesinti-api-ayarlari.module';
import { Pharmacy, PharmacySchema } from './schemas/pharmacy.schema';
import { AdminPharmaciesController } from './admin-pharmacies.controller';
import { AdminPharmaciesService } from './admin-pharmacies.service';
import { PharmaciesController } from './pharmacies.controller';
import { PharmaciesService } from './pharmacies.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pharmacy.name, schema: PharmacySchema },
    ]),
    KesintiApiAyarlariModule,
  ],
  controllers: [PharmaciesController, AdminPharmaciesController],
  providers: [PharmaciesService, AdminPharmaciesService],
  exports: [MongooseModule],
})
export class PharmaciesModule {}
