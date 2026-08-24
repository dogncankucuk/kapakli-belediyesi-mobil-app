import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  YardimMerkeziSoru,
  YardimMerkeziSoruSchema,
} from './schemas/yardim-merkezi-soru.schema';
import { AdminYardimMerkeziController } from './admin-yardim-merkezi.controller';
import { AdminYardimMerkeziService } from './admin-yardim-merkezi.service';
import { YardimMerkeziController } from './yardim-merkezi.controller';
import { YardimMerkeziService } from './yardim-merkezi.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: YardimMerkeziSoru.name, schema: YardimMerkeziSoruSchema },
    ]),
  ],
  controllers: [YardimMerkeziController, AdminYardimMerkeziController],
  providers: [YardimMerkeziService, AdminYardimMerkeziService],
  exports: [MongooseModule],
})
export class YardimMerkeziModule {}
