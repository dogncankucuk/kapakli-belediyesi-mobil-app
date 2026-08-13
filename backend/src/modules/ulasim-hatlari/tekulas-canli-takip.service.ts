import { Injectable, Logger } from '@nestjs/common';

export interface CanliOtobus {
  plaka: string;
  hiz: number;
  lat: number;
  lng: number;
  hatAdi: string;
  sonVeriSaati: string;
}

interface TekulasBusResponse {
  success: boolean;
  data?: {
    isSuccess?: boolean;
    data?:
      | {
          plate: string;
          speed: number;
          latitude: number;
          longitude: number;
          longRouteName: string;
          date: string;
        }[]
      | null;
  };
}

const AJAX_URL = 'https://www.tekulas.com.tr/wp-admin/admin-ajax.php';
const CACHE_TTL_MS = 15_000;

// T.C. Tekirdag Buyuksehir Belediyesi'nin ulasim sirketi Tekulas A.S.'nin
// kendi web sitesindeki (tekulas.com.tr/ulasim/<id>) "Otobusum Nerede?"
// ozelliginin arkasindaki WordPress AJAX endpoint'i - dogrudan tarayicidan
// curl ile bulundu, resmi/dokumante bir API degil. Kimlik dogrulama
// gerekmiyor. "line_code" degeri sitenin kendi ic kodu (UlasimHatti.hatKodu
// alaninda saklaniyor), sayfada goruntulenen hat adiyla AYNI DEGIL.
@Injectable()
export class TekulasCanliTakipService {
  private readonly logger = new Logger(TekulasCanliTakipService.name);
  private readonly cache = new Map<
    string,
    { items: CanliOtobus[]; fetchedAt: number }
  >();

  async getCanliOtobusler(hatKodu: string): Promise<CanliOtobus[]> {
    const cached = this.cache.get(hatKodu);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.items;
    }

    try {
      const body = new URLSearchParams({
        action: 'tekulas_get_bus_locations',
        line_code: hatKodu,
      });
      const response = await fetch(AJAX_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = (await response.json()) as TekulasBusResponse;
      const buses = json.data?.data ?? [];
      const items: CanliOtobus[] = buses.map((bus) => ({
        plaka: bus.plate,
        hiz: bus.speed,
        lat: bus.latitude,
        lng: bus.longitude,
        hatAdi: bus.longRouteName,
        sonVeriSaati: bus.date,
      }));

      this.cache.set(hatKodu, { items, fetchedAt: Date.now() });
      return items;
    } catch (error) {
      this.logger.warn(`Tekulaş canlı takip verisi alınamadı: ${error}`);
      return cached?.items ?? [];
    }
  }
}
