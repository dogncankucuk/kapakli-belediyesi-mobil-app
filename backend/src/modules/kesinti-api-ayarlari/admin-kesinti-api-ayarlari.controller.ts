import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import { SuperAdminGuard } from '../../admin/auth/super-admin.guard';
import { SetKesintiApiAyariDto } from './dto/set-kesinti-api-ayari.dto';
import { KesintiApiAyarlariService } from './kesinti-api-ayarlari.service';
import { KesintiApiTuru } from './schemas/kesinti-api-ayari.schema';

function turuDogrula(tur: string): KesintiApiTuru {
  if (tur !== 'su' && tur !== 'elektrik' && tur !== 'ulasim' && tur !== 'eczane') {
    throw new BadRequestException('Geçersiz kesinti türü');
  }
  return tur;
}

// Sadece Super Admin'in gorebilecegi/degistirebilecegi kesinti API
// adresleri - bkz. SuperAdminGuard. Diger tum admin endpoint'lerinden
// farkli olarak RbacGuard/RequirePermission kullanmiyor, cunku bu yetki
// hicbir role devredilemez olmali.
@Controller('admin-api/kesinti-api-ayarlari')
@UseGuards(SessionAuthGuard, SuperAdminGuard)
export class AdminKesintiApiAyarlariController {
  constructor(
    private readonly kesintiApiAyarlariService: KesintiApiAyarlariService,
  ) {}

  @Get(':tur')
  getir(@Param('tur') tur: string): Promise<{ apiUrl: string }> {
    return this.kesintiApiAyarlariService.getForAdmin(turuDogrula(tur));
  }

  @Put(':tur')
  ayarla(
    @Param('tur') tur: string,
    @Body() dto: SetKesintiApiAyariDto,
    @Req() req: Request,
  ): Promise<{ apiUrl: string }> {
    return this.kesintiApiAyarlariService.setApiUrl(
      turuDogrula(tur),
      dto.apiUrl,
      req.session.adminUser!.email,
    );
  }
}
