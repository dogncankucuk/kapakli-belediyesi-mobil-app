import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Cami, CamiSchema } from './schemas/cami.schema';
import { AdminCamilerController } from './admin-camiler.controller';
import { AdminCamilerService } from './admin-camiler.service';
import { CamilerController } from './camiler.controller';
import { CamilerService } from './camiler.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cami.name, schema: CamiSchema }]),
  ],
  controllers: [CamilerController, AdminCamilerController],
  providers: [CamilerService, AdminCamilerService],
  exports: [MongooseModule],
})
export class CamilerModule {}
