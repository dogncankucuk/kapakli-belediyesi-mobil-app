import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { RbacGuard } from '../../admin/auth/rbac.guard';
import { RequirePermission } from '../../admin/auth/require-permission.decorator';
import { SessionAuthGuard } from '../../admin/auth/session-auth.guard';
import {
  AdminPharmacy,
  AdminPharmaciesService,
} from './admin-pharmacies.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { TeoCsvQueryDto } from './dto/teo-csv-query.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import {
  ScrapedEczane,
  TeoEczaneScraperService,
} from './teo-eczane-scraper.service';

const MAX_GUN_ARALIGI = 31;

function csvAlani(deger: string | number | null): string {
  const metin = deger === null ? '' : String(deger);
  if (/[",\n]/.test(metin)) {
    return `"${metin.replace(/"/g, '""')}"`;
  }
  return metin;
}

function eczaneListesiniCsvYap(rows: ScrapedEczane[]): string {
  const baslik = [
    'Tarih',
    'Eczane Adı',
    'Adres',
    'Telefon',
    'Adres Tarifi',
    'Enlem',
    'Boylam',
    'Harita Konumu',
  ];
  const satirlar = rows.map((r) =>
    [
      r.tarih,
      r.ad,
      r.adres,
      r.telefon,
      r.adresTarifi,
      r.lat,
      r.lng,
      r.haritaUrl,
    ]
      .map(csvAlani)
      .join(','),
  );
  // Excel'de Türkçe karakterlerin dogru gorunmesi icin UTF-8 BOM ekleniyor.
  return '﻿' + [baslik.join(','), ...satirlar].join('\r\n');
}

function tarihAraligi(baslangic: string, bitis: string): string[] {
  const gunler: string[] = [];
  const cursor = new Date(baslangic + 'T00:00:00Z');
  const son = new Date(bitis + 'T00:00:00Z');
  while (cursor <= son) {
    gunler.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return gunler;
}

@Controller('admin-api/pharmacies')
@UseGuards(SessionAuthGuard, RbacGuard)
export class AdminPharmaciesController {
  constructor(
    private readonly adminPharmaciesService: AdminPharmaciesService,
    private readonly teoEczaneScraperService: TeoEczaneScraperService,
  ) {}

  @Get()
  @RequirePermission('pharmacies', 'list')
  findAll(): Promise<AdminPharmacy[]> {
    return this.adminPharmaciesService.findAll();
  }

  // Tekirdag Eczacilar Odasi'nin nobetci eczane sayfasindan secilen tarih
  // araligi + ilce icin CSV uretir - mevcut "CSV ile Toplu Yukleme" ile ayni
  // sekilde ice aktarilabilir (Tarih/Eczane Adi/Telefon/Adres/Lat/Lng
  // basliklarini taniyor, Adres Tarifi ve Harita Konumu sadece referans
  // icin ekstra sutunlardir).
  @Get('teo-csv')
  @RequirePermission('pharmacies', 'create')
  async teoCsv(
    @Query() query: TeoCsvQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const gunler = tarihAraligi(query.baslangic, query.bitis);
    if (gunler.length === 0) {
      throw new BadRequestException(
        'Bitiş tarihi başlangıç tarihinden önce olamaz.',
      );
    }
    if (gunler.length > MAX_GUN_ARALIGI) {
      throw new BadRequestException(
        `En fazla ${MAX_GUN_ARALIGI} günlük bir aralık seçebilirsiniz.`,
      );
    }

    const tumSatirlar: ScrapedEczane[] = [];
    for (const gun of gunler) {
      const gunSatirlari = await this.teoEczaneScraperService.scrapeGun(
        gun,
        query.ilce,
      );
      tumSatirlar.push(...gunSatirlari);
    }

    const csv = eczaneListesiniCsvYap(tumSatirlar);
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="nobetci-eczaneler-${query.baslangic}-${query.bitis}.csv"`,
    });
    return csv;
  }

  @Get(':id')
  @RequirePermission('pharmacies', 'show')
  async findOne(@Param('id') id: string): Promise<AdminPharmacy> {
    const pharmacy = await this.adminPharmaciesService.findOne(id);
    if (!pharmacy) {
      throw new NotFoundException();
    }
    return pharmacy;
  }

  @Post()
  @RequirePermission('pharmacies', 'create')
  create(
    @Body() dto: CreatePharmacyDto,
    @Req() req: Request,
  ): Promise<AdminPharmacy> {
    return this.adminPharmaciesService.create(
      dto,
      req.session.adminUser!.email,
    );
  }

  @Patch(':id')
  @RequirePermission('pharmacies', 'edit')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePharmacyDto,
    @Req() req: Request,
  ): Promise<AdminPharmacy> {
    const updated = await this.adminPharmaciesService.update(
      id,
      dto,
      req.session.adminUser!.email,
    );
    if (!updated) {
      throw new NotFoundException();
    }
    return updated;
  }

  @Delete(':id')
  @RequirePermission('pharmacies', 'delete')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    const removed = await this.adminPharmaciesService.remove(id);
    if (!removed) {
      throw new NotFoundException();
    }
    return { success: true };
  }
}
