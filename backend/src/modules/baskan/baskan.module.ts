import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Baskan, BaskanSchema } from './schemas/baskan.schema';
import { AdminBaskanController } from './admin-baskan.controller';
import { AdminBaskanService } from './admin-baskan.service';
import { BaskanController } from './baskan.controller';
import { BaskanService } from './baskan.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Baskan.name, schema: BaskanSchema }]),
  ],
  controllers: [BaskanController, AdminBaskanController],
  providers: [BaskanService, AdminBaskanService],
  exports: [MongooseModule],
})
export class BaskanModule {}
