import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Hakkimizda, HakkimizdaSchema } from './schemas/hakkimizda.schema';
import { AdminHakkimizdaController } from './admin-hakkimizda.controller';
import { AdminHakkimizdaService } from './admin-hakkimizda.service';
import { HakkimizdaController } from './hakkimizda.controller';
import { HakkimizdaService } from './hakkimizda.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Hakkimizda.name, schema: HakkimizdaSchema },
    ]),
  ],
  controllers: [HakkimizdaController, AdminHakkimizdaController],
  providers: [HakkimizdaService, AdminHakkimizdaService],
  exports: [MongooseModule],
})
export class HakkimizdaModule {}
