import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Ihale, IhaleSchema } from './schemas/ihale.schema';
import { AdminIhalelerController } from './admin-ihaleler.controller';
import { AdminIhalelerService } from './admin-ihaleler.service';
import { IhalelerController } from './ihaleler.controller';
import { IhalelerService } from './ihaleler.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ihale.name, schema: IhaleSchema }]),
  ],
  controllers: [IhalelerController, AdminIhalelerController],
  providers: [IhalelerService, AdminIhalelerService],
  exports: [MongooseModule],
})
export class IhalelerModule {}
