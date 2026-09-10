import { Injectable, Logger } from '@nestjs/common';

// Belediyenin resmi CBS'i (GiSoftGis) altindaki GeoServer WFS servisinden
// (herkese acik, kimlik dogrulamasi gerektirmiyor) nokta verisi ceker.
// srsName=EPSG:4326 istegi ile GeoServer koordinatlari otomatik olarak
// standart lat/lng'ye ceviriyor - bizim tarafta hicbir donusum gerekmiyor.
const WFS_BASE = 'https://cbs.kapakli.bel.tr/geoserver/ows';

export interface CbsSenkronizeSonucu {
  bulunan: number;
  eklenen: number;
  guncellenen: number;
}

export interface CbsPoi {
  ad: string;
  lat: number;
  lng: number;
  districtId: number | null;
  poiId: string | null;
}

interface GeoJsonFeature {
  geometry?: { type: string; coordinates: unknown };
  properties?: Record<string, unknown>;
}

interface GeoJsonFeatureCollection {
  features: GeoJsonFeature[];
}

@Injectable()
export class CbsKaynakService {
  private readonly logger = new Logger(CbsKaynakService.name);
  // Mahalle adlari degismedigi icin process omru boyunca tek seferlik cekilip
  // bellekte tutuluyor (her POI senkronizasyonunda tekrar cekmeye gerek yok).
  private districtCache: Map<number, string> | null = null;

  // adPropertyAdi: cogu katmanda isim "name" alaninda geliyor, ama bazilari
  // (ör. gi_prk_park_const) kendi ozel alan adini kullaniyor (ör. "park_name").
  async getPois(typeName: string, adPropertyAdi = 'name'): Promise<CbsPoi[]> {
    const url =
      `${WFS_BASE}?service=WFS&version=2.0.0&request=GetFeature` +
      `&typeName=${encodeURIComponent(typeName)}&outputFormat=application/json&srsName=EPSG:4326`;

    let veri: GeoJsonFeatureCollection;
    try {
      const yanit = await fetch(url);
      if (!yanit.ok) {
        throw new Error(`CBS sunucusu ${yanit.status} dondu`);
      }
      veri = (await yanit.json()) as GeoJsonFeatureCollection;
    } catch (err) {
      this.logger.error(`CBS'ten ${typeName} cekilemedi`, err as Error);
      throw new Error('CBS sunucusuna ulaşılamadı');
    }

    return (veri.features ?? [])
      .filter(
        (f) =>
          (f.geometry?.type === 'Point' ||
            f.geometry?.type === 'Polygon' ||
            f.geometry?.type === 'MultiPolygon') &&
          typeof f.properties?.[adPropertyAdi] === 'string' &&
          (f.properties[adPropertyAdi] as string).trim(),
      )
      .map((f) => {
        const [lng, lat] = this.merkezNoktasiBul(f.geometry!);
        return {
          ad: this.ciftKodlamayiDuzelt(
            (f.properties![adPropertyAdi] as string).trim(),
          ),
          lng,
          lat,
          districtId:
            typeof f.properties?.district_id === 'number'
              ? (f.properties.district_id as number)
              : null,
          poiId:
            typeof f.properties?.poi_id === 'string'
              ? (f.properties.poi_id as string)
              : typeof f.properties?.park_id === 'number'
                ? String(f.properties.park_id)
                : null,
        };
      });
  }

  // Point icin koordinati oldugu gibi dondurur; Polygon/MultiPolygon icin
  // dis halkanin alan-agirlikli merkezini (centroid) hesaplar - harita
  // uzerinde tek bir isaretci konumu gerektigi icin.
  private merkezNoktasiBul(geometry: {
    type: string;
    coordinates: unknown;
  }): [number, number] {
    if (geometry.type === 'Point') {
      return geometry.coordinates as [number, number];
    }
    const disHalka: [number, number][] =
      geometry.type === 'MultiPolygon'
        ? (geometry.coordinates as [number, number][][][])[0][0]
        : (geometry.coordinates as [number, number][][])[0];

    let alan = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < disHalka.length - 1; i++) {
      const [x0, y0] = disHalka[i];
      const [x1, y1] = disHalka[i + 1];
      const carpraz = x0 * y1 - x1 * y0;
      alan += carpraz;
      cx += (x0 + x1) * carpraz;
      cy += (y0 + y1) * carpraz;
    }
    alan /= 2;
    if (alan === 0) {
      const n = disHalka.length;
      return [
        disHalka.reduce((s, [x]) => s + x, 0) / n,
        disHalka.reduce((s, [, y]) => s + y, 0) / n,
      ];
    }
    return [cx / (6 * alan), cy / (6 * alan)];
  }

  // Bazi CBS katmanlari (orn. gi_scp_wireless_network_point) Turkce metni
  // cift UTF-8 kodlamayla donduruyor (ör. "Ãeken" yerine "Çeken"). Yalnizca
  // bu bozulmanin izi varsa ve gercek Latin-1-disi Turkce harf (ı/İ/ğ/Ş vb.)
  // yoksa duzeltmeyi uygula - aksi halde zaten dogru metni bozar.
  private ciftKodlamayiDuzelt(metin: string): string {
    if (!/[ÃÂÄÅ]/.test(metin) || /[ıİğĞşŞ]/.test(metin)) return metin;
    try {
      const duzeltilmis = Buffer.from(metin, 'latin1').toString('utf8');
      return duzeltilmis.includes('�') ? metin : duzeltilmis;
    } catch {
      return metin;
    }
  }

  // "UZUNHACI" gibi tamamen buyuk harfli bir adi normal baslik formatina
  // cevirir (Turkce karakterler dahil - İ/I ayrimina dikkat). Mahalle
  // adlarinin yani sira ayni sekilde tumu buyuk harf donen diger CBS
  // katmanlari (ör. park adlari) icin de kullanilabilsin diye public.
  baslikYap(metin: string): string {
    return metin
      .toLocaleLowerCase('tr-TR')
      .split(' ')
      .map((kelime) =>
        kelime ? kelime[0].toLocaleUpperCase('tr-TR') + kelime.slice(1) : kelime,
      )
      .join(' ');
  }

  async getAdres(districtId: number | null): Promise<string | null> {
    if (districtId === null) return null;

    if (!this.districtCache) {
      this.districtCache = new Map();
      try {
        const url =
          `${WFS_BASE}?service=WFS&version=2.0.0&request=GetFeature` +
          `&typeName=gisoft:gi_num_district&outputFormat=application/json` +
          `&propertyName=district_id,district_name`;
        const yanit = await fetch(url);
        if (yanit.ok) {
          const veri = (await yanit.json()) as GeoJsonFeatureCollection;
          for (const f of veri.features ?? []) {
            const id = f.properties?.district_id;
            const ad = f.properties?.district_name;
            if (typeof id === 'number' && typeof ad === 'string') {
              this.districtCache.set(id, this.ciftKodlamayiDuzelt(ad));
            }
          }
        }
      } catch (err) {
        this.logger.warn('CBS mahalle listesi cekilemedi', err as Error);
      }
    }

    const adi = this.districtCache.get(districtId);
    return adi ? `${this.baslikYap(adi)} Mahallesi` : null;
  }
}
