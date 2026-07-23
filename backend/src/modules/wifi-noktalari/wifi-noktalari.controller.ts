import { Controller, Get } from '@nestjs/common';

import {
  PublicWifiNoktasi,
  WifiNoktalariService,
} from './wifi-noktalari.service';

@Controller('wifi-noktalari')
export class WifiNoktalariController {
  constructor(private readonly wifiNoktalariService: WifiNoktalariService) {}

  @Get()
  findAll(): Promise<PublicWifiNoktasi[]> {
    return this.wifiNoktalariService.findAll();
  }
}
