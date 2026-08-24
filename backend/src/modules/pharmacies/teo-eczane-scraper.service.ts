import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as https from 'https';

export interface ScrapedEczane {
  tarih: string; // YYYY-MM-DD
  ad: string;
  adres: string;
  adresTarifi: string;
  telefon: string;
  lat: number | null;
  lng: number | null;
  haritaUrl: string;
}

const TEO_URL = 'https://www.teo.org.tr/nobetci-eczaneler';
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

// Tekirdag Eczacilar Odasi'nin (TEO) resmi "Nobetci Eczaneler" arama formunun
// (tarih1 + ilce POST edilir, ayni sayfa "Arama Sonuclari" bolumunu doner)
// HTML'ini kazir. Site baska bir yapisal API sunmuyor - her eczane bloğunun
// haritaya cikan linki (maps.google.com/maps?q=lat,lng) enlem/boylami
// dogrudan verdigi icin ayrica geocoding gerekmiyor.
@Injectable()
export class TeoEczaneScraperService {
  private readonly logger = new Logger(TeoEczaneScraperService.name);

  async scrapeGun(tarih: string, ilceKodu: string): Promise<ScrapedEczane[]> {
    const html = await this.postForm(tarih, ilceKodu);
    try {
      return this.parseHtml(html, tarih);
    } catch (error) {
      this.logger.warn(`${tarih} icin TEO HTML'i ayristirilamadi: ${error}`);
      return [];
    }
  }

  // Node'un global fetch'i (undici) bu sunucuya baglanirken sabit 10sn'lik
  // bir baglanti zaman asimina takiliyor - baglanti aslinda kuruluyor ama
  // biraz yavas (10sn'nin hemen ustunde). Node'un yerlesik https modulunu
  // daha uzun bir zaman asimiyla kullanmak bu sorunu asiyor.
  private postForm(tarih: string, ilceKodu: string): Promise<string> {
    const body = new URLSearchParams({
      tarih1: tarih,
      ilce: ilceKodu,
      gnr: 'NÖBET GÖSTER',
    }).toString();

    return new Promise((resolve, reject) => {
      const req = https.request(
        TEO_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body),
            'User-Agent': BROWSER_USER_AGENT,
          },
          timeout: 25_000,
        },
        (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`TEO sitesi ${res.statusCode} döndü`));
            res.resume();
            return;
          }
          const chunks: Buffer[] = [];
          res.on('data', (chunk: Buffer) => chunks.push(chunk));
          res.on('end', () =>
            resolve(Buffer.concat(chunks).toString('utf-8')),
          );
        },
      );
      req.on('timeout', () => req.destroy(new Error('TEO sitesi zaman aşımına uğradı')));
      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }

  private parseHtml(html: string, tarih: string): ScrapedEczane[] {
    const $ = cheerio.load(html);
    const rows: ScrapedEczane[] = [];

    $('.nobetci').each((_, el) => {
      const block = $(el);
      const ad = block.find('h4.tred strong').first().text().split(' - ')[0].trim();
      if (!ad) return;

      // Adres iki parcadan olusuyor: "fa-home" ikonundan sonraki ilk satir
      // (asil adres) ve <br> ile ayrilan ikinci satir (tarif/landmark) -
      // ikisi arasinda baska bir etiket yok, bu yuzden ham HTML uzerinde
      // regex ile ayikliyoruz (DOM'da ayri elemanlar degil, duz metin).
      const pInner = block.find('p').first().html() ?? '';
      const addressMatch = pInner.match(
        /fa-home[^>]*><\/i>\s*([\s\S]*?)<br>([\s\S]*?)(?:<br>)?\s*<i[^>]*fa-phone/,
      );
      const adres = addressMatch
        ? addressMatch[1].replace(/\s+/g, ' ').trim()
        : '';
      const adresTarifi = addressMatch
        ? addressMatch[2].replace(/\s+/g, ' ').trim()
        : '';

      const telefonHref = block.find('a[href^="tel:"]').first().attr('href') ?? '';
      const telefon = telefonHref.replace('tel:', '').trim();

      const haritaUrl =
        block.find('a[href*="maps.google.com"], a[href*="google.com/maps"]').first().attr('href') ?? '';
      const coordMatch = haritaUrl.match(/q=([\d.]+),([\d.]+)/);
      const lat = coordMatch ? Number(coordMatch[1]) : null;
      const lng = coordMatch ? Number(coordMatch[2]) : null;

      rows.push({ tarih, ad, adres, adresTarifi, telefon, lat, lng, haritaUrl });
    });

    return rows;
  }
}
