import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CbsModule } from '../cbs/cbs.module';
import { AtikNoktasi, AtikNoktasiSchema } from './schemas/atik-noktasi.schema';
import { AdminAtikNoktalariController } from './admin-atik-noktalari.controller';
import { AdminAtikNoktalariService } from './admin-atik-noktalari.service';
import { AtikNoktalariController } from './atik-noktalari.controller';
import { AtikNoktalariService } from './atik-noktalari.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AtikNoktasi.name, schema: AtikNoktasiSchema },
    ]),
    CbsModule,
  ],
  controllers: [AtikNoktalariController, AdminAtikNoktalariController],
  providers: [AtikNoktalariService, AdminAtikNoktalariService],
  exports: [MongooseModule],
})
export class AtikNoktalariModule {}
