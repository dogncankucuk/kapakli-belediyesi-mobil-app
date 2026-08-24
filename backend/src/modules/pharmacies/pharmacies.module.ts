import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Pharmacy, PharmacySchema } from './schemas/pharmacy.schema';
import { AdminPharmaciesController } from './admin-pharmacies.controller';
import { AdminPharmaciesService } from './admin-pharmacies.service';
import { PharmaciesController } from './pharmacies.controller';
import { PharmaciesService } from './pharmacies.service';
import { TeoEczaneScraperService } from './teo-eczane-scraper.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Pharmacy.name, schema: PharmacySchema },
    ]),
  ],
  controllers: [PharmaciesController, AdminPharmaciesController],
  providers: [
    PharmaciesService,
    AdminPharmaciesService,
    TeoEczaneScraperService,
  ],
  exports: [MongooseModule],
})
export class PharmaciesModule {}
