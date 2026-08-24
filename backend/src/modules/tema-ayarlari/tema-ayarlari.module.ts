import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TemaAyarlari, TemaAyarlariSchema } from './schemas/tema-ayarlari.schema';
import { AdminTemaAyarlariController } from './admin-tema-ayarlari.controller';
import { AdminTemaAyarlariService } from './admin-tema-ayarlari.service';
import { TemaAyarlariController } from './tema-ayarlari.controller';
import { TemaAyarlariService } from './tema-ayarlari.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TemaAyarlari.name, schema: TemaAyarlariSchema },
    ]),
  ],
  controllers: [TemaAyarlariController, AdminTemaAyarlariController],
  providers: [TemaAyarlariService, AdminTemaAyarlariService],
  exports: [MongooseModule],
})
export class TemaAyarlariModule {}
