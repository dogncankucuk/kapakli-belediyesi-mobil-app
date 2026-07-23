import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { VefatIlani, VefatIlaniSchema } from './schemas/vefat-ilani.schema';
import { AdminVefatEdenlerController } from './admin-vefat-edenler.controller';
import { AdminVefatEdenlerService } from './admin-vefat-edenler.service';
import { VefatEdenlerController } from './vefat-edenler.controller';
import { VefatEdenlerService } from './vefat-edenler.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: VefatIlani.name, schema: VefatIlaniSchema },
    ]),
  ],
  controllers: [VefatEdenlerController, AdminVefatEdenlerController],
  providers: [VefatEdenlerService, AdminVefatEdenlerService],
  exports: [MongooseModule],
})
export class VefatEdenlerModule {}
