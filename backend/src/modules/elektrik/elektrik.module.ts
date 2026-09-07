import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NotificationsModule } from '../notifications/notifications.module';
import {
  ElektrikKesintisi,
  ElektrikKesintisiSchema,
} from './schemas/elektrik-kesintisi.schema';
import { AdminElektrikKesintisiController } from './admin-elektrik-kesintisi.controller';
import { AdminElektrikKesintisiService } from './admin-elektrik-kesintisi.service';
import { ElektrikKesintisiController } from './elektrik-kesintisi.controller';
import { ElektrikKesintisiService } from './elektrik-kesintisi.service';

@Module({
  imports: [
    NotificationsModule,
    MongooseModule.forFeature([
      { name: ElektrikKesintisi.name, schema: ElektrikKesintisiSchema },
    ]),
  ],
  controllers: [ElektrikKesintisiController, AdminElektrikKesintisiController],
  providers: [ElektrikKesintisiService, AdminElektrikKesintisiService],
  exports: [MongooseModule],
})
export class ElektrikModule {}
