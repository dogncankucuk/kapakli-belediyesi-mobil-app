import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FormBelgesi, FormBelgesiSchema } from './schemas/form-belgesi.schema';
import { AdminFormlarController } from './admin-formlar.controller';
import { AdminFormlarService } from './admin-formlar.service';
import { FormlarController } from './formlar.controller';
import { FormlarService } from './formlar.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FormBelgesi.name, schema: FormBelgesiSchema },
    ]),
  ],
  controllers: [FormlarController, AdminFormlarController],
  providers: [FormlarService, AdminFormlarService],
  exports: [MongooseModule],
})
export class FormlarModule {}
