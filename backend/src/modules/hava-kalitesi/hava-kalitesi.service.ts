import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

// T.C. Cevre, Sehircilik ve Iklim Degisikligi Bakanligi'nin resmi Surekli
// Izleme Merkezi (SIM) hava kalitesi agi - stateless, auth gerektirmiyor.
// Kapakli'nin kendi istasyonu yok; en yakin resmi istasyon Tekirdag-Cerkezkoy
// (Kapakli tarihsel olarak Cerkezkoy'e bagliydi, bkz. architecture.md/PRD.md).
const SIM_BASE_URL = 'https://sim.csb.gov.tr/Services';
const STATION_LIST_ID = '157'; // Tekirdag - Cerkezkoy - MTHM

const CACHE_TTL_MS = 10 * 60 * 1000; // gorevli sayfa da ~15 dk'da bir yeniliyor

interface AirQualityStatus {
  key: number;
  ad: string;
  renk: string;
  aciklama: string;
}

// sim.csb.gov.tr'nin /Services/GetAirQualityStatus yanitindan alinmis sabit
// esikler (2026-07-22 itibariyle) - nadiren degisen yasal kategoriler,
// her istekte ayrica cagirmaya gerek yok.
const DURUM_TABLOSU: AirQualityStatus[] = [
  {
    key: 0,
    ad: 'İyi',
    renk: '#0d9255',
    aciklama: 'Hava kalitesi iyi seviyededir.',
  },
  {
    key: 1,
    ad: 'Orta',
    renk: '#f8c90e',
    aciklama:
      'Hava kalitesi uygun olup, hava kirliliğine hassas gruplar orta düzeyde etkilenebilir.',
  },
  {
    key: 2,
    ad: 'Hassas',
    renk: '#ec7c1e',
    aciklama:
      'Hassas gruplar için sağlık etkileri oluşabilir. Genel halkın etkilenmesi beklenmemektedir.',
  },
  {
    key: 3,
    ad: 'Sağlıksız',
    renk: '#bc0101',
    aciklama:
      'Hassas gruplar ciddi sağlık sorunları yaşayabilir. Genel halkın bazı sağlık etkileri yaşaması muhtemeldir.',
  },
  {
    key: 4,
    ad: 'Kötü',
    renk: '#ae0b54',
    aciklama:
      'Nüfusun tamamının hava kirliliğinden etkilenme olasılığı yüksek olup, hassas gruplar açık hava etkinliklerini kısıtlamalıdır.',
  },
  {
    key: 5,
    ad: 'Tehlikeli',
    renk: '#950f35',
    aciklama:
      'Herkes, ciddi sağlık etkileri yaşayabilir. Açık hava etkinliklerinden kaçınılmalıdır.',
  },
  {
    key: 99,
    ad: 'Ölçüm Yok',
    renk: '#afafaf',
    aciklama: 'Henüz mevcut saat için ölçüm yok.',
  },
];

function durumBul(statusKey: number): AirQualityStatus {
  return (
    DURUM_TABLOSU.find((d) => d.key === statusKey) ??
    DURUM_TABLOSU[DURUM_TABLOSU.length - 1]
  );
}

interface StationSummary {
  Id: string;
  Name: string;
  Index: number;
  QualityParameter: string;
  Received: string;
  Status: number;
}

interface AqiValueRow {
  NO2: number;
  SO2: number;
  CO: number;
  O3: number;
  PM10: number;
  PM25: number;
}

export interface PublicHavaKalitesi {
  istasyonAdi: string;
  olcumZamani: string;
  aqi: number;
  durum: AirQualityStatus;
  baskinKirletici: string;
  kirleticiler: {
    pm25: number | null;
    pm10: number | null;
    no2: number | null;
    so2: number | null;
    co: number | null;
    o3: number | null;
  };
}

@Injectable()
export class HavaKalitesiService {
  private readonly logger = new Logger(HavaKalitesiService.name);
  private cache: { data: PublicHavaKalitesi; expiresAt: number } | null = null;

  async getCurrent(): Promise<PublicHavaKalitesi> {
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.data;
    }

    try {
      const data = await this.fetchFromSim();
      this.cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
      return data;
    } catch (error) {
      this.logger.warn(`SİM hava kalitesi verisi alınamadı: ${error}`);
      if (this.cache) {
        // Bayat da olsa son bilinen veriyi donduruyoruz (architecture.md
        // §8: "dis veri cekilemezse uygulama cokmez").
        return this.cache.data;
      }
      throw new ServiceUnavailableException('Hava kalitesi verisi alınamadı');
    }
  }

  private async fetchFromSim(): Promise<PublicHavaKalitesi> {
    const summaryRes = await fetch(`${SIM_BASE_URL}/AirQualityDetailsData`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: `id=${STATION_LIST_ID}&numberPlate=`,
    });
    if (!summaryRes.ok) {
      throw new Error(`AirQualityDetailsData HTTP ${summaryRes.status}`);
    }
    const stations = (await summaryRes.json()) as StationSummary[];
    const station = stations[0];
    if (!station) {
      throw new Error('İstasyon verisi boş döndü');
    }

    let kirleticiler: PublicHavaKalitesi['kirleticiler'] = {
      pm25: null,
      pm10: null,
      no2: null,
      so2: null,
      co: null,
      o3: null,
    };

    try {
      const detailRes = await fetch(
        `${SIM_BASE_URL}/GetAirQualityStationDetail?type=0`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: `stationId=${station.Id}&endDate=${encodeURIComponent(`${station.Received}:00`)}`,
        },
      );
      if (detailRes.ok) {
        const detailJson = (await detailRes.json()) as {
          objects?: { AQIValues?: AqiValueRow[] };
        };
        const latest = detailJson.objects?.AQIValues?.[0];
        if (latest) {
          kirleticiler = {
            pm25: latest.PM25 ?? null,
            pm10: latest.PM10 ?? null,
            no2: latest.NO2 ?? null,
            so2: latest.SO2 ?? null,
            co: latest.CO ?? null,
            o3: latest.O3 ?? null,
          };
        }
      }
    } catch (error) {
      // Kirletici detayi opsiyonel - alinamazsa AQI/durum bilgisiyle devam edilir.
      this.logger.warn(`Kirletici detayı alınamadı: ${error}`);
    }

    return {
      istasyonAdi: station.Name,
      olcumZamani: parseSimDate(station.Received),
      aqi: Math.round(station.Index),
      durum: durumBul(station.Status),
      baskinKirletici: station.QualityParameter,
      kirleticiler,
    };
  }
}

// SIM API tarihleri "DD.MM.YYYY HH:mm" formatinda donduruyor (Turkiye yerel
// saati); ISO string'e ceviriyoruz.
function parseSimDate(simDate: string): string {
  const match = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/.exec(simDate);
  if (!match) return new Date().toISOString();
  const [, day, month, year, hour, minute] = match;
  return new Date(
    `${year}-${month}-${day}T${hour}:${minute}:00+03:00`,
  ).toISOString();
}
