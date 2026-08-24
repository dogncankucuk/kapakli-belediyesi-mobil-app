import { Controller, Get } from '@nestjs/common';

import { PanelTemasiService, PublicPanelTemasi } from './panel-temasi.service';

// Kimlik dogrulamasiz - login ekrani bile bu temaya gore boyanmali, bu
// yuzden auth guard yok (sadece gorunum verisi, hassas veri degil).
@Controller('panel-temasi')
export class PanelTemasiController {
  constructor(private readonly panelTemasiService: PanelTemasiService) {}

  @Get()
  get(): Promise<PublicPanelTemasi> {
    return this.panelTemasiService.get();
  }
}
