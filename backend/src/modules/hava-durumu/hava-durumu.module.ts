import { Module } from '@nestjs/common';

import { HavaDurumuController } from './hava-durumu.controller';
import { HavaDurumuService } from './hava-durumu.service';

@Module({
  controllers: [HavaDurumuController],
  providers: [HavaDurumuService],
})
export class HavaDurumuModule {}
