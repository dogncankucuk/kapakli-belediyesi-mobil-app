import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  RequestCounter,
  RequestCounterSchema,
} from './schemas/request-counter.schema';
import { RequestItem, RequestSchema } from './schemas/request.schema';
import { AdminRequestsController } from './admin-requests.controller';
import { AdminRequestsService } from './admin-requests.service';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestItem.name, schema: RequestSchema },
      { name: RequestCounter.name, schema: RequestCounterSchema },
    ]),
  ],
  controllers: [RequestsController, AdminRequestsController],
  providers: [RequestsService, AdminRequestsService],
  exports: [MongooseModule],
})
export class RequestsModule {}
