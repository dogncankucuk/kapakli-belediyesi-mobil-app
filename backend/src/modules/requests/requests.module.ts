import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RequestItem, RequestSchema } from './schemas/request.schema';
import { AdminRequestsController } from './admin-requests.controller';
import { AdminRequestsService } from './admin-requests.service';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RequestItem.name, schema: RequestSchema },
    ]),
  ],
  controllers: [RequestsController, AdminRequestsController],
  providers: [RequestsService, AdminRequestsService],
  exports: [MongooseModule],
})
export class RequestsModule {}
