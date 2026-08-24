import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PanelTemasi, PanelTemasiSchema } from './schemas/panel-temasi.schema';
import { AdminPanelTemasiController } from './admin-panel-temasi.controller';
import { AdminPanelTemasiService } from './admin-panel-temasi.service';
import { PanelTemasiController } from './panel-temasi.controller';
import { PanelTemasiService } from './panel-temasi.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PanelTemasi.name, schema: PanelTemasiSchema },
    ]),
  ],
  controllers: [PanelTemasiController, AdminPanelTemasiController],
  providers: [PanelTemasiService, AdminPanelTemasiService],
  exports: [MongooseModule],
})
export class PanelTemasiModule {}
