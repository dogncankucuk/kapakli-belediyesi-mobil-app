import { Module } from '@nestjs/common';

import { HavaKalitesiController } from './hava-kalitesi.controller';
import { HavaKalitesiService } from './hava-kalitesi.service';

@Module({
  controllers: [HavaKalitesiController],
  providers: [HavaKalitesiService],
})
export class HavaKalitesiModule {}
