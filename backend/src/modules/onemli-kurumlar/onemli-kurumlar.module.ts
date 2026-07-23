import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { OnemliKurum, OnemliKurumSchema } from './schemas/onemli-kurum.schema';
import { AdminOnemliKurumlarController } from './admin-onemli-kurumlar.controller';
import { AdminOnemliKurumlarService } from './admin-onemli-kurumlar.service';
import { OnemliKurumlarController } from './onemli-kurumlar.controller';
import { OnemliKurumlarService } from './onemli-kurumlar.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OnemliKurum.name, schema: OnemliKurumSchema },
    ]),
  ],
  controllers: [OnemliKurumlarController, AdminOnemliKurumlarController],
  providers: [OnemliKurumlarService, AdminOnemliKurumlarService],
  exports: [MongooseModule],
})
export class OnemliKurumlarModule {}
