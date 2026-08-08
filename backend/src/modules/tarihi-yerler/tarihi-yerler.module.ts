import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TarihiYer, TarihiYerSchema } from './schemas/tarihi-yer.schema';
import { AdminTarihiYerlerController } from './admin-tarihi-yerler.controller';
import { AdminTarihiYerlerService } from './admin-tarihi-yerler.service';
import { TarihiYerlerController } from './tarihi-yerler.controller';
import { TarihiYerlerService } from './tarihi-yerler.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TarihiYer.name, schema: TarihiYerSchema },
    ]),
  ],
  controllers: [TarihiYerlerController, AdminTarihiYerlerController],
  providers: [TarihiYerlerService, AdminTarihiYerlerService],
  exports: [MongooseModule],
})
export class TarihiYerlerModule {}
