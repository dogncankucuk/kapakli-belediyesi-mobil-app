import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PlanliKesinti, PlanliKesintiDocument } from './schemas/planli-kesinti.schema';

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntities(text: string): string {
  return text.replace(/&(\w+);/g, (match, name: string) => NAMED_ENTITIES[name] ?? match);
}

function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, '')).trim();
}

type KaynakSatiri = {
  baslangic: string;
  bitis: string;
  nedeni: string;
  yer: string;
};

// Genel amacli bir HTML tablo ayiklayici - <tbody> icindeki satirlari,
// hucreleri 4 sutuna (baslangic/bitis/nedeni/yer) esler. TESKI'nin su
// kesintileri sayfasi bu yapida ("teski.gov.tr/sukesintileri" ile ayni
// sablon), ama admin farkli bir kaynak URL'si girerse de calismaya calisir.
function parseKaynakTablosu(html: string): KaynakSatiri[] {
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  if (!tbodyMatch) return [];

  const rows = tbodyMatch[1].match(/<tr>[\s\S]*?<\/tr>/gi) ?? [];

  return rows
    .map((row) => {
      const cells = row.match(/<td>([\s\S]*?)<\/td>/gi) ?? [];
      return cells.map((cell) =>
        stripTags(cell.replace(/^<td>/i, '').replace(/<\/td>$/i, '')),
      );
    })
    .filter((cells) => cells.length >= 4)
    .map((cells) => ({
      baslangic: cells[0],
      bitis: cells[1],
      nedeni: cells[2],
      yer: cells[3].replace(/[\s/]+$/, ''),
    }));
}

// "12.03.2026 09:00" / "12.03.2026" gibi bir metinden gun.ay.yil'i ISO
// tarihe cevirir - bulamazsa bugunun tarihini kullanir (kayit yine de
// olusturulsun, tarih bilgisi metnin icinde zaten aciklamada korunuyor).
function tarihCikar(raw: string): string {
  const match = raw.match(/(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/);
  if (match) {
    const [, gun, ay, yil] = match;
    return `${yil}-${ay.padStart(2, '0')}-${gun.padStart(2, '0')}`;
  }
  return new Date().toISOString().slice(0, 10);
}

export interface KesintilerCekSonucu {
  bulunan: number;
  eklenen: number;
}

@Injectable()
export class SuHizmetleriKaynakService {
  constructor(
    @InjectModel(PlanliKesinti.name)
    private readonly planliKesintiModel: Model<PlanliKesintiDocument>,
  ) {}

  async cekVeIceAktar(
    url: string,
    updatedBy: string,
  ): Promise<KesintilerCekSonucu> {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'User-Agent': BROWSER_USER_AGENT },
      });
    } catch {
      throw new BadRequestException('Kaynak adrese ulaşılamadı');
    }

    if (!response.ok) {
      throw new BadRequestException('Kaynak sayfa alınamadı');
    }

    const html = await response.text();
    const satirlar = parseKaynakTablosu(html);

    let eklenen = 0;
    for (const satir of satirlar) {
      await this.planliKesintiModel.create({
        tarih: new Date(tarihCikar(satir.baslangic)),
        ilce: satir.yer || '-',
        aciklama: `${satir.nedeni} (${satir.baslangic} - ${satir.bitis})`,
        updatedBy,
      });
      eklenen++;
    }

    return { bulunan: satirlar.length, eklenen };
  }
}
