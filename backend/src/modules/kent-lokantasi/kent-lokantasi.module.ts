import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GununMenusu, GununMenusuSchema } from './schemas/gunun-menusu.schema';
import { AdminKentLokantasiController } from './admin-kent-lokantasi.controller';
import { AdminKentLokantasiService } from './admin-kent-lokantasi.service';
import { KentLokantasiController } from './kent-lokantasi.controller';
import { KentLokantasiService } from './kent-lokantasi.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GununMenusu.name, schema: GununMenusuSchema },
    ]),
  ],
  controllers: [KentLokantasiController, AdminKentLokantasiController],
  providers: [KentLokantasiService, AdminKentLokantasiService],
  exports: [MongooseModule],
})
export class KentLokantasiModule {}
