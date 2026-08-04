import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';

import { PublicAnnouncement } from './announcements.service';

const SOURCE_URL = 'https://www.kapakli.bel.tr/guncel/duyurular';
const CACHE_TTL_MS = 15 * 60 * 1000;

const TURKISH_MONTHS: Record<string, string> = {
  ocak: '01',
  şubat: '02',
  subat: '02',
  mart: '03',
  nisan: '04',
  mayıs: '05',
  mayis: '05',
  haziran: '06',
  temmuz: '07',
  ağustos: '08',
  agustos: '08',
  eylül: '09',
  eylul: '09',
  ekim: '10',
  kasım: '11',
  kasim: '11',
  aralık: '12',
  aralik: '12',
};

function parseTurkishDate(text: string): Date | null {
  const match = text
    .trim()
    .match(/^(\d{1,2})\s+([a-zA-ZçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})$/);
  if (!match) return null;

  const [, day, monthName, year] = match;
  const month = TURKISH_MONTHS[monthName.toLocaleLowerCase('tr-TR')];
  if (!month) return null;

  return new Date(`${year}-${month}-${day.padStart(2, '0')}T00:00:00.000Z`);
}

// Belediyenin resmi sitesindeki duyurular sayfasini (sunucu tarafinda
// render edilen duz HTML) canli olarak cekip ayristirir. Sonuc, mobil
// uygulamanin admin panelden girilen duyurularla birlikte gosterebilmesi
// icin PublicAnnouncement formatina cevrilir.
@Injectable()
export class KapakliWebAnnouncementsService {
  private readonly logger = new Logger(KapakliWebAnnouncementsService.name);
  private cache: { items: PublicAnnouncement[]; fetchedAt: number } | null =
    null;

  async findAll(): Promise<PublicAnnouncement[]> {
    if (this.cache && Date.now() - this.cache.fetchedAt < CACHE_TTL_MS) {
      return this.cache.items;
    }

    try {
      const items = await this.scrape();
      this.cache = { items, fetchedAt: Date.now() };
      return items;
    } catch (error) {
      this.logger.warn(`Kapaklı web duyuruları çekilemedi: ${error}`);
      return this.cache?.items ?? [];
    }
  }

  private async scrape(): Promise<PublicAnnouncement[]> {
    const response = await fetch(SOURCE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; KapakliBelApp/1.0)',
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const items: PublicAnnouncement[] = [];

    $('.page-list').each((_, el) => {
      const anchor = $(el).find('a.page-title').first();
      const baslik = anchor.text().trim();
      const href = anchor.attr('href') ?? '';
      const dateText = $(el).find('.page-date').first().text().trim();
      const tarih = parseTurkishDate(dateText);
      if (!baslik || !tarih) return;

      const slug = href.split('/').filter(Boolean).pop() ?? baslik;

      items.push({
        id: `web-${slug}`,
        baslik,
        icerik: $(el).find('.page-summary').first().text().trim(),
        resimUrl: null,
        yayinTarihi: tarih.toISOString(),
        kategori: 'duyuru',
      });
    });

    return items;
  }
}
