import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

// T.C. Meteoroloji Genel Mudurlugu'nun (MGM) resmi, ucretsiz web servisi.
// Kimlik dogrulama gerektirmiyor ama Referer/Origin basliklari olmadan
// "Not allowed by MGM" hatasi donuyor (basit anti-scraping onlemi).
const MGM_BASE_URL = 'https://servis.mgm.gov.tr/web';
const MGM_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  Referer: 'https://www.mgm.gov.tr/',
  Origin: 'https://www.mgm.gov.tr',
  'X-Requested-With': 'XMLHttpRequest',
};

// Kapakli'nin kendi MGM istasyonu var (mgm.gov.tr/web/merkezler?il=Tekirdag&ilce=Kapakli
// ile dogrulandi, 2026-07-22) - sabit merkez/istasyon numaralari, sik degismez.
const MERKEZ_ID = 95902;
const GUNLUK_TAHMIN_ISTNO = 95902;

const CACHE_TTL_MS = 15 * 60 * 1000;

// MGM'nin kendi sitesindeki convertHadise() fonksiyonundan (mainService.js)
// birebir alinmis kod->aciklama eslemesi.
const HADISE_ACIKLAMALARI: Record<string, string> = {
  A: 'Açık',
  AB: 'Az Bulutlu',
  PB: 'Parçalı Bulutlu',
  CB: 'Çok Bulutlu',
  HY: 'Hafif Yağmurlu',
  Y: 'Yağmurlu',
  KY: 'Kuvvetli Yağmurlu',
  KKY: 'Karla Karışık Yağmurlu',
  HKY: 'Hafif Kar Yağışlı',
  K: 'Kar Yağışlı',
  YKY: 'Yoğun Kar Yağışlı',
  HSY: 'Hafif Sağanak Yağışlı',
  SY: 'Sağanak Yağışlı',
  KSY: 'Kuvvetli Sağanak Yağışlı',
  MSY: 'Mevzi Sağanak Yağışlı',
  DY: 'Dolu',
  GSY: 'Gökgürültülü Sağanak Yağışlı',
  KGY: 'Kuvvetli Gökgürültülü Sağanak Yağışlı',
  SIS: 'Sisli',
  PUS: 'Puslu',
  DMN: 'Dumanlı',
  KF: 'Kum veya Toz Taşınımı',
  R: 'Rüzgarlı',
  GKR: 'Güneyli Kuvvetli Rüzgar',
  KKR: 'Kuzeyli Kuvvetli Rüzgar',
  SCK: 'Sıcak',
  SGK: 'Soğuk',
  HHY: 'Yağışlı',
};

function hadiseAdi(kod: string): string {
  return HADISE_ACIKLAMALARI[kod] ?? kod;
}

interface SonDurumRow {
  veriZamani: string;
  sicaklik: number;
  hissedilenSicaklik: number;
  nem: number;
  ruzgarHiz: number;
  hadiseKodu: string;
}

interface GunlukTahminRow {
  [key: string]: string | number;
}

export interface GunlukTahmin {
  tarih: string;
  enDusuk: number;
  enYuksek: number;
  durumKodu: string;
  durumAdi: string;
}

export interface PublicHavaDurumu {
  sicaklik: number;
  hissedilenSicaklik: number;
  nem: number;
  ruzgarHiz: number;
  durumKodu: string;
  durumAdi: string;
  olcumZamani: string;
  gunlukTahmin: GunlukTahmin[];
}

@Injectable()
export class HavaDurumuService {
  private readonly logger = new Logger(HavaDurumuService.name);
  private cache: { data: PublicHavaDurumu; expiresAt: number } | null = null;

  async getCurrent(): Promise<PublicHavaDurumu> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.data;
    }

    try {
      const data = await this.fetchFromMgm();
      this.cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      return data;
    } catch (error) {
      this.logger.warn(`MGM hava durumu verisi alınamadı: ${error}`);
      if (this.cache) {
        return this.cache.data;
      }
      throw new ServiceUnavailableException('Hava durumu verisi alınamadı');
    }
  }

  private async fetchFromMgm(): Promise<PublicHavaDurumu> {
    const [sonDurumRes, gunlukRes] = await Promise.all([
      fetch(`${MGM_BASE_URL}/sondurumlar?merkezid=${MERKEZ_ID}`, {
        headers: MGM_HEADERS,
      }),
      fetch(`${MGM_BASE_URL}/tahminler/gunluk?istno=${GUNLUK_TAHMIN_ISTNO}`, {
        headers: MGM_HEADERS,
      }),
    ]);

    if (!sonDurumRes.ok) {
      throw new Error(`sondurumlar HTTP ${sonDurumRes.status}`);
    }
    const sonDurumRows = (await sonDurumRes.json()) as SonDurumRow[];
    const sonDurum = sonDurumRows[0];
    if (!sonDurum) {
      throw new Error('Son durum verisi boş döndü');
    }

    let gunlukTahmin: GunlukTahmin[] = [];
    if (gunlukRes.ok) {
      const gunlukRows = (await gunlukRes.json()) as GunlukTahminRow[];
      const gunluk = gunlukRows[0];
      if (gunluk) {
        gunlukTahmin = [0, 1, 2, 3, 4, 5]
          .filter((gun) => gunluk[`tarihGun${gun}`] !== undefined)
          .map((gun) => {
            const durumKodu = String(gunluk[`hadiseGun${gun}`] ?? '');
            return {
              tarih: String(gunluk[`tarihGun${gun}`]),
              enDusuk: Number(gunluk[`enDusukGun${gun}`]),
              enYuksek: Number(gunluk[`enYuksekGun${gun}`]),
              durumKodu,
              durumAdi: hadiseAdi(durumKodu),
            };
          });
      }
    } else {
      this.logger.warn(`tahminler/gunluk HTTP ${gunlukRes.status}`);
    }

    return {
      sicaklik: sonDurum.sicaklik,
      hissedilenSicaklik: sonDurum.hissedilenSicaklik,
      nem: sonDurum.nem,
      ruzgarHiz: sonDurum.ruzgarHiz,
      durumKodu: sonDurum.hadiseKodu,
      durumAdi: hadiseAdi(sonDurum.hadiseKodu),
      olcumZamani: sonDurum.veriZamani,
      gunlukTahmin,
    };
  }
}
