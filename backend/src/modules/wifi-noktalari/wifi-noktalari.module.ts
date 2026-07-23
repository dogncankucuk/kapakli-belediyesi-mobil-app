import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WifiNoktasi, WifiNoktasiSchema } from './schemas/wifi-noktasi.schema';
import { AdminWifiNoktalariController } from './admin-wifi-noktalari.controller';
import { AdminWifiNoktalariService } from './admin-wifi-noktalari.service';
import { WifiNoktalariController } from './wifi-noktalari.controller';
import { WifiNoktalariService } from './wifi-noktalari.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WifiNoktasi.name, schema: WifiNoktasiSchema },
    ]),
  ],
  controllers: [WifiNoktalariController, AdminWifiNoktalariController],
  providers: [WifiNoktalariService, AdminWifiNoktalariService],
  exports: [MongooseModule],
})
export class WifiNoktalariModule {}
