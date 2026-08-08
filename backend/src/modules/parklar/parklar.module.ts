import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Park, ParkSchema } from './schemas/park.schema';
import { AdminParklarController } from './admin-parklar.controller';
import { AdminParklarService } from './admin-parklar.service';
import { ParklarController } from './parklar.controller';
import { ParklarService } from './parklar.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Park.name, schema: ParkSchema }]),
  ],
  controllers: [ParklarController, AdminParklarController],
  providers: [ParklarService, AdminParklarService],
  exports: [MongooseModule],
})
export class ParklarModule {}
