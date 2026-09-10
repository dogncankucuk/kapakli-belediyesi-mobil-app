import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Medya, MedyaSchema } from './schemas/medya.schema';
import {
  MedyaKlasoru,
  MedyaKlasoruSchema,
} from './schemas/medya-klasoru.schema';
import { AdminMedyaController } from './admin-medya.controller';
import { AdminMedyaService } from './admin-medya.service';
import { AdminMedyaKlasorleriController } from './admin-medya-klasorleri.controller';
import { AdminMedyaKlasorleriService } from './admin-medya-klasorleri.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Medya.name, schema: MedyaSchema },
      { name: MedyaKlasoru.name, schema: MedyaKlasoruSchema },
    ]),
  ],
  controllers: [AdminMedyaController, AdminMedyaKlasorleriController],
  providers: [AdminMedyaService, AdminMedyaKlasorleriService],
  exports: [MongooseModule],
})
export class MedyaModule {}
