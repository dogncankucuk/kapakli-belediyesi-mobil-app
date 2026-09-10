export const BASE_URL = "http://localhost:3000";

export function resolveMediaUrl(url: string): string {
  return url.startsWith("/") ? `${BASE_URL}${url}` : url;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`İstek başarısız oldu (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// "Haber benzeri" icerik - Haberler/Duyurular/Ilanlar/Ihaleler ayni sekli
// paylasiyor (bkz. backend'deki ilgili service'ler).
export interface HaberBenzeriIcerik {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
}

export function getHaberler() {
  return get<HaberBenzeriIcerik[]>("/haberler");
}

export function getDuyurular() {
  return get<HaberBenzeriIcerik[]>("/announcements");
}

export function getIlanlar() {
  return get<HaberBenzeriIcerik[]>("/ilanlar");
}

export function getIhaleler() {
  return get<HaberBenzeriIcerik[]>("/ihaleler");
}

export interface MeclisGundemi {
  id: string;
  baslik: string;
  tarih: string;
  icerik: string;
}

export function getMeclisGundemleri() {
  return get<MeclisGundemi[]>("/meclis-gundemleri");
}

export interface MeclisKarari {
  id: string;
  kararNo: string;
  kategori: string;
  tarih: string;
  baslik: string;
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
}

export function getMeclisKararlari() {
  return get<MeclisKarari[]>("/meclis-kararlari");
}

export interface Baskan {
  ad: string;
  photoUrl: string | null;
  introText: string;
}

export function getBaskan() {
  return get<Baskan>("/baskan");
}

export interface Hakkimizda {
  baskanOzetMetni: string;
}

export function getHakkimizda() {
  return get<Hakkimizda>("/hakkimizda");
}

export interface BizeUlasin {
  telefon: string;
  whatsapp: string;
  eposta: string;
  adres: string;
  lat: number;
  lng: number;
}

export function getBizeUlasin() {
  return get<BizeUlasin>("/bize-ulasin");
}

// Kent Rehberi haritasindaki tum nokta kategorileri ayni temel sekli
// paylasiyor.
export interface HaritaNoktasi {
  id: string;
  ad: string;
  tur?: string;
  adres: string | null;
  lat: number;
  lng: number;
}

export function getCamiler() {
  return get<HaritaNoktasi[]>("/camiler");
}

export function getOnemliKurumlar() {
  return get<HaritaNoktasi[]>("/onemli-kurumlar");
}

export function getEgitimKurumlari() {
  return get<HaritaNoktasi[]>("/egitim");
}

export function getSaglikKurumlari() {
  return get<HaritaNoktasi[]>("/saglik");
}

export function getAtikNoktalari() {
  return get<HaritaNoktasi[]>("/atik-noktalari");
}

export function getWifiNoktalari() {
  return get<HaritaNoktasi[]>("/wifi-noktalari");
}

export function getParklar() {
  return get<HaritaNoktasi[]>("/parklar");
}

export function getPharmacies() {
  return get<
    {
      id: string;
      ad: string;
      adres: string;
      telefon: string;
      nobetTarihi: string;
      lat: number;
      lng: number;
    }[]
  >("/pharmacies");
}
