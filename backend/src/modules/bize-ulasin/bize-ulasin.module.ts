import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BizeUlasin, BizeUlasinSchema } from './schemas/bize-ulasin.schema';
import { AdminBizeUlasinController } from './admin-bize-ulasin.controller';
import { AdminBizeUlasinService } from './admin-bize-ulasin.service';
import { BizeUlasinController } from './bize-ulasin.controller';
import { BizeUlasinService } from './bize-ulasin.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BizeUlasin.name, schema: BizeUlasinSchema },
    ]),
  ],
  controllers: [BizeUlasinController, AdminBizeUlasinController],
  providers: [BizeUlasinService, AdminBizeUlasinService],
  exports: [MongooseModule],
})
export class BizeUlasinModule {}
