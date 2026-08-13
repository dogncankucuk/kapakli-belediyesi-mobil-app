import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminAseviController } from './admin-asevi.controller';
import { AdminAseviService } from './admin-asevi.service';
import { AseviController } from './asevi.controller';
import { AseviService } from './asevi.service';
import {
  AseviBasvuru,
  AseviBasvuruSchema,
} from './schemas/asevi-basvuru.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AseviBasvuru.name, schema: AseviBasvuruSchema },
    ]),
  ],
  controllers: [AseviController, AdminAseviController],
  providers: [AseviService, AdminAseviService],
  exports: [MongooseModule],
})
export class AseviModule {}
