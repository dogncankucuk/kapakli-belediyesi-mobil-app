import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminSuHizmetleriAyarlari,
  AdminSuHizmetleriAyarlariService,
} from './admin-su-hizmetleri-ayarlari.service';
import { CekKesintilerDto } from './dto/cek-kesintiler.dto';
import { UpdateSuHizmetleriAyarlariDto } from './dto/update-su-hizmetleri-ayarlari.dto';
import {
  KesintilerCekSonucu,
  SuHizmetleriKaynakService,
} from './su-hizmetleri-kaynak.service';

@Controller('admin-api/su-hizmetleri-ayarlari')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminSuHizmetleriAyarlariController {
  constructor(
    private readonly adminSuHizmetleriAyarlariService: AdminSuHizmetleriAyarlariService,
    private readonly suHizmetleriKaynakService: SuHizmetleriKaynakService,
  ) {}

  @Get()
  @RequirePermission('suHizmetleri', 'show')
  get(): Promise<AdminSuHizmetleriAyarlari> {
    return this.adminSuHizmetleriAyarlariService.get();
  }

  @Patch()
  @RequirePermission('suHizmetleri', 'edit')
  update(
    @Body() dto: UpdateSuHizmetleriAyarlariDto,
    @Req() req: Request,
  ): Promise<AdminSuHizmetleriAyarlari> {
    return this.adminSuHizmetleriAyarlariService.update(
      dto,
      req.session.adminUser!.email,
    );
  }

  // Ayarlarda kayitli (ya da istekle birlikte gelen) kaynak URL'sini
  // fetch'leyip Planli Kesintiler tablosuna satir olarak aktarir.
  @Post('kesintiler-cek')
  @RequirePermission('suHizmetleri', 'create')
  async kesintilerCek(
    @Body() dto: CekKesintilerDto,
    @Req() req: Request,
  ): Promise<KesintilerCekSonucu> {
    const ayarlar = await this.adminSuHizmetleriAyarlariService.get();
    const url = dto.url || ayarlar.kesintilerKaynakUrl;
    if (!url) {
      throw new BadRequestException('Kaynak URL tanımlı değil');
    }
    return this.suHizmetleriKaynakService.cekVeIceAktar(
      url,
      req.session.adminUser!.email,
    );
  }
}
