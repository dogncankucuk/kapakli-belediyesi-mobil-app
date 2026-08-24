import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Medya, MedyaSchema } from './schemas/medya.schema';
import { AdminMedyaController } from './admin-medya.controller';
import { AdminMedyaService } from './admin-medya.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Medya.name, schema: MedyaSchema }]),
  ],
  controllers: [AdminMedyaController],
  providers: [AdminMedyaService],
  exports: [MongooseModule],
})
export class MedyaModule {}
