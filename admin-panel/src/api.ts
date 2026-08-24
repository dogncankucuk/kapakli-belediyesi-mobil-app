import type {
  AdminAccount,
  AdminRole,
  AdminUser,
  Announcement,
  Appointment,
  AtikNoktasi,
  Baraj,
  BasvuruHizmeti,
  Cami,
  CitizenUser,
  AseviBasvuru,
  AseviBasvuruDurumu,
  Baskan,
  BizeUlasinBilgisi,
  FaturaOdemeKurumu,
  FormBelgesi,
  Haber,
  Hakkimizda,
  Ihale,
  Ilan,
  Makale,
  MeclisGundemi,
  MeclisKarari,
  MedyaDosyasi,
  OnemliKurum,
  Park,
  PlanliKesinti,
  Pharmacy,
  SuHizmetleriAyarlari,
  ResourcePermission,
  TalepDurumu,
  TalepRequest,
  PanelTemasi,
  TarihiYer,
  TemaAyarlari,
  UlasimHatti,
  UlasimSecenegi,
  VefatIlani,
  WifiNoktasi,
  YardimMerkeziSoru,
} from './types';

const API_BASE = '/admin-api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    let message = `İstek başarısız oldu (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // yanıt gövdesi yoksa varsayılan mesaj kullanılır
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

// NOT: TOTP alanı geçici olarak devre dışı (ADMIN_REQUIRE_TOTP=false, bkz.
// backend/.env) - geri açıldığında bu fonksiyona ve LoginPage'e totpToken
// parametresi/alanı tekrar eklenmeli.
export function login(email: string, password: string) {
  return request<AdminUser>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<{ success: boolean }>('/auth/logout', { method: 'POST' });
}

export function me() {
  return request<AdminUser>('/auth/me');
}

export function getAnnouncements() {
  return request<Announcement[]>('/announcements');
}

export type AnnouncementInput = {
  baslik: string;
  icerik: string;
  resimUrl: string | null;
  yayinTarihi: string;
  kategori: string;
};

export function createAnnouncement(data: AnnouncementInput) {
  return request<Announcement>('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAnnouncement(id: string, data: Partial<AnnouncementInput>) {
  return request<Announcement>(`/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAnnouncement(id: string) {
  return request<{ success: boolean }>(`/announcements/${id}`, { method: 'DELETE' });
}

export type ArticleContentInput = {
  baslik: string;
  icerik: string;
  resimUrl: string | null;
  yayinTarihi: string;
};

export function getHaberler() {
  return request<Haber[]>('/haberler');
}

export function createHaber(data: ArticleContentInput) {
  return request<Haber>('/haberler', { method: 'POST', body: JSON.stringify(data) });
}

export function updateHaber(id: string, data: Partial<ArticleContentInput>) {
  return request<Haber>(`/haberler/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteHaber(id: string) {
  return request<{ success: boolean }>(`/haberler/${id}`, { method: 'DELETE' });
}

export function getIlanlar() {
  return request<Ilan[]>('/ilanlar');
}

export function createIlan(data: ArticleContentInput) {
  return request<Ilan>('/ilanlar', { method: 'POST', body: JSON.stringify(data) });
}

export function updateIlan(id: string, data: Partial<ArticleContentInput>) {
  return request<Ilan>(`/ilanlar/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteIlan(id: string) {
  return request<{ success: boolean }>(`/ilanlar/${id}`, { method: 'DELETE' });
}

export function getIhaleler() {
  return request<Ihale[]>('/ihaleler');
}

export function createIhale(data: ArticleContentInput) {
  return request<Ihale>('/ihaleler', { method: 'POST', body: JSON.stringify(data) });
}

export function updateIhale(id: string, data: Partial<ArticleContentInput>) {
  return request<Ihale>(`/ihaleler/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteIhale(id: string) {
  return request<{ success: boolean }>(`/ihaleler/${id}`, { method: 'DELETE' });
}

export function getMakaleler() {
  return request<Makale[]>('/makaleler');
}

export function createMakale(data: ArticleContentInput) {
  return request<Makale>('/makaleler', { method: 'POST', body: JSON.stringify(data) });
}

export function updateMakale(id: string, data: Partial<ArticleContentInput>) {
  return request<Makale>(`/makaleler/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteMakale(id: string) {
  return request<{ success: boolean }>(`/makaleler/${id}`, { method: 'DELETE' });
}

export type MeclisGundemiInput = {
  baslik: string;
  tarih: string;
  dosyaUrl: string | null;
};

export function getMeclisGundemleri() {
  return request<MeclisGundemi[]>('/meclis-gundemleri');
}

export function createMeclisGundemi(data: MeclisGundemiInput) {
  return request<MeclisGundemi>('/meclis-gundemleri', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMeclisGundemi(id: string, data: Partial<MeclisGundemiInput>) {
  return request<MeclisGundemi>(`/meclis-gundemleri/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteMeclisGundemi(id: string) {
  return request<{ success: boolean }>(`/meclis-gundemleri/${id}`, { method: 'DELETE' });
}

export function getBaskan() {
  return request<Baskan>('/baskan');
}

export type BaskanInput = {
  ad: string;
  photoUrl: string | null;
  introText: string;
  maddeler: string[];
  kapanisText: string;
};

export function updateBaskan(data: BaskanInput) {
  return request<Baskan>('/baskan', { method: 'PATCH', body: JSON.stringify(data) });
}

export function getHakkimizda() {
  return request<Hakkimizda>('/hakkimizda');
}

export type HakkimizdaInput = {
  baskanOzetMetni: string;
  tarihcePhotoUrl: string | null;
  tarihceParagraflari: string[];
  kurulusYili: string;
  buyuksehirYili: string;
  nufus: string;
};

export function updateHakkimizda(data: HakkimizdaInput) {
  return request<Hakkimizda>('/hakkimizda', { method: 'PATCH', body: JSON.stringify(data) });
}

export function getBizeUlasin() {
  return request<BizeUlasinBilgisi>('/bize-ulasin');
}

export type BizeUlasinInput = {
  telefon: string;
  whatsapp: string;
  eposta: string;
  adres: string;
  lat: number;
  lng: number;
};

export function updateBizeUlasin(data: BizeUlasinInput) {
  return request<BizeUlasinBilgisi>('/bize-ulasin', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getYardimMerkeziSorulari() {
  return request<YardimMerkeziSoru[]>('/yardim-merkezi');
}

export type YardimMerkeziSoruInput = {
  soru: string;
  cevap: string;
};

export function createYardimMerkeziSoru(data: YardimMerkeziSoruInput) {
  return request<YardimMerkeziSoru>('/yardim-merkezi', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateYardimMerkeziSoru(
  id: string,
  data: Partial<YardimMerkeziSoruInput>,
) {
  return request<YardimMerkeziSoru>(`/yardim-merkezi/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteYardimMerkeziSoru(id: string) {
  return request<{ success: boolean }>(`/yardim-merkezi/${id}`, { method: 'DELETE' });
}

export type FaturaOdemeKurumuInput = {
  ad: string;
  aciklama: string;
  url: string;
};

export function getFaturaOdemeKurumlari() {
  return request<FaturaOdemeKurumu[]>('/fatura-odeme');
}

export function createFaturaOdemeKurumu(data: FaturaOdemeKurumuInput) {
  return request<FaturaOdemeKurumu>('/fatura-odeme', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateFaturaOdemeKurumu(
  id: string,
  data: Partial<FaturaOdemeKurumuInput>,
) {
  return request<FaturaOdemeKurumu>(`/fatura-odeme/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteFaturaOdemeKurumu(id: string) {
  return request<{ success: boolean }>(`/fatura-odeme/${id}`, { method: 'DELETE' });
}

export type UlasimSecenegiInput = {
  baslik: string;
  aciklama: string;
  url: string;
};

export function getUlasimSecenekleri() {
  return request<UlasimSecenegi[]>('/ulasim-hizmetleri');
}

export function createUlasimSecenegi(data: UlasimSecenegiInput) {
  return request<UlasimSecenegi>('/ulasim-hizmetleri', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateUlasimSecenegi(
  id: string,
  data: Partial<UlasimSecenegiInput>,
) {
  return request<UlasimSecenegi>(`/ulasim-hizmetleri/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteUlasimSecenegi(id: string) {
  return request<{ success: boolean }>(`/ulasim-hizmetleri/${id}`, { method: 'DELETE' });
}

export type UlasimHattiInput = {
  hatAdi: string;
  guzergah: string;
  durum: string;
  canli: boolean;
  hatKodu?: string;
};

export function getUlasimHatlari() {
  return request<UlasimHatti[]>('/ulasim-hatlari');
}

export function createUlasimHatti(data: UlasimHattiInput) {
  return request<UlasimHatti>('/ulasim-hatlari', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateUlasimHatti(id: string, data: Partial<UlasimHattiInput>) {
  return request<UlasimHatti>(`/ulasim-hatlari/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteUlasimHatti(id: string) {
  return request<{ success: boolean }>(`/ulasim-hatlari/${id}`, { method: 'DELETE' });
}

export function getTemaAyarlari() {
  return request<TemaAyarlari>('/tema-ayarlari');
}

export type TemaAyarlariInput = {
  primaryColorLight: string;
  secondaryColorLight: string;
  backgroundColorLight: string;
  primaryColorDark: string;
  secondaryColorDark: string;
  backgroundColorDark: string;
  fontFamily: string;
};

export function updateTemaAyarlari(data: TemaAyarlariInput) {
  return request<TemaAyarlari>('/tema-ayarlari', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Kimlik dogrulamasiz genel endpoint (/panel-temasi, /admin-api altinda
// DEGIL) - login ekrani dahil her sayfada temayi uygulamak icin App.tsx
// acilista bunu cagirir. API_BASE prefiksini kullanan request() helper'i
// bilerek atlıyoruz.
export async function getPublicPanelTemasi(): Promise<PanelTemasi> {
  const res = await fetch('/panel-temasi');
  if (!res.ok) throw new Error('Panel teması alınamadı');
  return res.json();
}

export function getPanelTemasi() {
  return request<PanelTemasi>('/panel-temasi');
}

export type PanelTemasiInput = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  radius: number;
};

export function updatePanelTemasi(data: PanelTemasiInput) {
  return request<PanelTemasi>('/panel-temasi', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getAppointments() {
  return request<Appointment[]>('/appointments');
}

export type AppointmentInput = {
  hizmetTuru: string;
  tarih: string;
  saat: string;
  durum: string;
};

export function updateAppointment(id: string, data: Partial<AppointmentInput>) {
  return request<Appointment>(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function getRequests() {
  return request<TalepRequest[]>('/requests');
}

export function updateRequest(id: string, durum: TalepDurumu) {
  return request<TalepRequest>(`/requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ durum }),
  });
}

export type PharmacyInput = {
  ad: string;
  adres: string;
  telefon: string;
  nobetTarihi: string;
  lat: number;
  lng: number;
};

export function getPharmacies() {
  return request<Pharmacy[]>('/pharmacies');
}

export function createPharmacy(data: PharmacyInput) {
  return request<Pharmacy>('/pharmacies', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePharmacy(id: string, data: Partial<PharmacyInput>) {
  return request<Pharmacy>(`/pharmacies/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deletePharmacy(id: string) {
  return request<{ success: boolean }>(`/pharmacies/${id}`, { method: 'DELETE' });
}

export type MeclisKarariInput = {
  kararNo: string;
  kategori: string;
  tarih: string;
  baslik: string;
};

export function getMeclisKararlari() {
  return request<MeclisKarari[]>('/meclis-kararlari');
}

export function createMeclisKarari(data: MeclisKarariInput) {
  return request<MeclisKarari>('/meclis-kararlari', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMeclisKarari(id: string, data: Partial<MeclisKarariInput>) {
  return request<MeclisKarari>(`/meclis-kararlari/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteMeclisKarari(id: string) {
  return request<{ success: boolean }>(`/meclis-kararlari/${id}`, { method: 'DELETE' });
}

export type VefatIlaniInput = {
  adSoyad: string;
  yas: number;
  not: string;
  mekan: string;
  namazVakti: string;
  tarih: string;
};

export function getVefatIlanlari() {
  return request<VefatIlani[]>('/vefat-edenler');
}

export function createVefatIlani(data: VefatIlaniInput) {
  return request<VefatIlani>('/vefat-edenler', { method: 'POST', body: JSON.stringify(data) });
}

export function updateVefatIlani(id: string, data: Partial<VefatIlaniInput>) {
  return request<VefatIlani>(`/vefat-edenler/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteVefatIlani(id: string) {
  return request<{ success: boolean }>(`/vefat-edenler/${id}`, { method: 'DELETE' });
}

export type WifiNoktasiInput = {
  ad: string;
  adres: string;
  kategori: string;
  lat: number;
  lng: number;
};

export function getWifiNoktalari() {
  return request<WifiNoktasi[]>('/wifi-noktalari');
}

export function createWifiNoktasi(data: WifiNoktasiInput) {
  return request<WifiNoktasi>('/wifi-noktalari', { method: 'POST', body: JSON.stringify(data) });
}

export function updateWifiNoktasi(id: string, data: Partial<WifiNoktasiInput>) {
  return request<WifiNoktasi>(`/wifi-noktalari/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteWifiNoktasi(id: string) {
  return request<{ success: boolean }>(`/wifi-noktalari/${id}`, { method: 'DELETE' });
}

export type BarajInput = {
  ad: string;
  doluluk: number;
};

export function getBarajlar() {
  return request<Baraj[]>('/barajlar');
}

export function createBaraj(data: BarajInput) {
  return request<Baraj>('/barajlar', { method: 'POST', body: JSON.stringify(data) });
}

export function updateBaraj(id: string, data: Partial<BarajInput>) {
  return request<Baraj>(`/barajlar/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteBaraj(id: string) {
  return request<{ success: boolean }>(`/barajlar/${id}`, { method: 'DELETE' });
}

export type PlanliKesintiInput = {
  tarih: string;
  ilce: string;
  aciklama: string;
};

export function getPlanliKesintiler() {
  return request<PlanliKesinti[]>('/planli-kesintiler');
}

export function createPlanliKesinti(data: PlanliKesintiInput) {
  return request<PlanliKesinti>('/planli-kesintiler', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updatePlanliKesinti(id: string, data: Partial<PlanliKesintiInput>) {
  return request<PlanliKesinti>(`/planli-kesintiler/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deletePlanliKesinti(id: string) {
  return request<{ success: boolean }>(`/planli-kesintiler/${id}`, { method: 'DELETE' });
}

export function getSuHizmetleriAyarlari() {
  return request<SuHizmetleriAyarlari>('/su-hizmetleri-ayarlari');
}

export type SuHizmetleriAyarlariInput = {
  kesintilerKaynakUrl: string;
  kesintilerGoruntulemeUrl: string;
};

export function updateSuHizmetleriAyarlari(data: SuHizmetleriAyarlariInput) {
  return request<SuHizmetleriAyarlari>('/su-hizmetleri-ayarlari', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function kesintilerCek(url?: string) {
  return request<{ bulunan: number; eklenen: number }>(
    '/su-hizmetleri-ayarlari/kesintiler-cek',
    { method: 'POST', body: JSON.stringify(url ? { url } : {}) },
  );
}

export function getMedyaDosyalari() {
  return request<MedyaDosyasi[]>('/medya');
}

// FormData govdesi gonderdigi icin genel request() yardimcisini kullanmiyor
// (o her zaman Content-Type: application/json ekliyor - multipart sinir
// (boundary) degerini tarayicinin kendisinin ayarlamasi gerekiyor).
export async function uploadMedya(dosya: File): Promise<MedyaDosyasi> {
  const formData = new FormData();
  formData.append('dosya', dosya);
  const res = await fetch(`${API_BASE}/medya`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    let message = `Dosya yüklenemedi (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // yanıt gövdesi yoksa varsayılan mesaj kullanılır
    }
    throw new Error(message);
  }
  return res.json();
}

export function deleteMedya(id: string) {
  return request<{ success: boolean }>(`/medya/${id}`, { method: 'DELETE' });
}

export function getAseviBasvurulari() {
  return request<AseviBasvuru[]>('/asevi');
}

export function updateAseviBasvuruDurum(id: string, durum: AseviBasvuruDurumu) {
  return request<AseviBasvuru>(`/asevi/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ durum }),
  });
}

export function deleteAseviBasvuru(id: string) {
  return request<{ success: boolean }>(`/asevi/${id}`, { method: 'DELETE' });
}

export type CamiInput = {
  ad: string;
  adres?: string;
  lat: number;
  lng: number;
};

export function getCamiler() {
  return request<Cami[]>('/camiler');
}

export function createCami(data: CamiInput) {
  return request<Cami>('/camiler', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCami(id: string, data: Partial<CamiInput>) {
  return request<Cami>(`/camiler/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteCami(id: string) {
  return request<{ success: boolean }>(`/camiler/${id}`, { method: 'DELETE' });
}

export type OnemliKurumInput = {
  ad: string;
  tur: string;
  adres?: string;
  lat: number;
  lng: number;
};

export function getOnemliKurumlar() {
  return request<OnemliKurum[]>('/onemli-kurumlar');
}

export function createOnemliKurum(data: OnemliKurumInput) {
  return request<OnemliKurum>('/onemli-kurumlar', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateOnemliKurum(id: string, data: Partial<OnemliKurumInput>) {
  return request<OnemliKurum>(`/onemli-kurumlar/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteOnemliKurum(id: string) {
  return request<{ success: boolean }>(`/onemli-kurumlar/${id}`, { method: 'DELETE' });
}

export type AtikNoktasiInput = {
  ad: string;
  tur: string;
  adres?: string;
  lat: number;
  lng: number;
};

export function getAtikNoktalari() {
  return request<AtikNoktasi[]>('/atik-noktalari');
}

export function createAtikNoktasi(data: AtikNoktasiInput) {
  return request<AtikNoktasi>('/atik-noktalari', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAtikNoktasi(id: string, data: Partial<AtikNoktasiInput>) {
  return request<AtikNoktasi>(`/atik-noktalari/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAtikNoktasi(id: string) {
  return request<{ success: boolean }>(`/atik-noktalari/${id}`, { method: 'DELETE' });
}

export type ParkInput = {
  ad: string;
  tur: string;
  adres?: string;
  lat: number;
  lng: number;
};

export function getParklar() {
  return request<Park[]>('/parklar');
}

export function createPark(data: ParkInput) {
  return request<Park>('/parklar', { method: 'POST', body: JSON.stringify(data) });
}

export function updatePark(id: string, data: Partial<ParkInput>) {
  return request<Park>(`/parklar/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deletePark(id: string) {
  return request<{ success: boolean }>(`/parklar/${id}`, { method: 'DELETE' });
}

export type TarihiYerInput = {
  ad: string;
  tur: string;
  adres?: string;
  lat: number;
  lng: number;
};

export function getTarihiYerler() {
  return request<TarihiYer[]>('/tarihi-yerler');
}

export function createTarihiYer(data: TarihiYerInput) {
  return request<TarihiYer>('/tarihi-yerler', { method: 'POST', body: JSON.stringify(data) });
}

export function updateTarihiYer(id: string, data: Partial<TarihiYerInput>) {
  return request<TarihiYer>(`/tarihi-yerler/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteTarihiYer(id: string) {
  return request<{ success: boolean }>(`/tarihi-yerler/${id}`, { method: 'DELETE' });
}

export type FormBelgesiInput = {
  baslik: string;
  url: string;
  tur: string;
};

export function getFormlar() {
  return request<FormBelgesi[]>('/formlar');
}

export function createFormBelgesi(data: FormBelgesiInput) {
  return request<FormBelgesi>('/formlar', { method: 'POST', body: JSON.stringify(data) });
}

export function updateFormBelgesi(id: string, data: Partial<FormBelgesiInput>) {
  return request<FormBelgesi>(`/formlar/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteFormBelgesi(id: string) {
  return request<{ success: boolean }>(`/formlar/${id}`, { method: 'DELETE' });
}

export type BasvuruHizmetiInput = {
  baslik: string;
  ozet: string;
  hizmetler: string[];
  kosullar: string[];
  calismaSaatleri: string;
  sorumluBirim: string;
  basvuruTuru: string;
  basvuruDegeri: string;
};

export function getBasvuruHizmetleri() {
  return request<BasvuruHizmeti[]>('/basvuru-hizmetleri');
}

export function createBasvuruHizmeti(data: BasvuruHizmetiInput) {
  return request<BasvuruHizmeti>('/basvuru-hizmetleri', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateBasvuruHizmeti(id: string, data: Partial<BasvuruHizmetiInput>) {
  return request<BasvuruHizmeti>(`/basvuru-hizmetleri/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteBasvuruHizmeti(id: string) {
  return request<{ success: boolean }>(`/basvuru-hizmetleri/${id}`, {
    method: 'DELETE',
  });
}

export function getUsers(search?: string) {
  const query = search?.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return request<CitizenUser[]>(`/users${query}`);
}

export function setUserDisabled(id: string, disabled: boolean) {
  return request<CitizenUser>(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ disabled }),
  });
}

export function deleteUser(id: string) {
  return request<void>(`/users/${id}`, { method: 'DELETE' });
}

export type RoleInput = {
  name: string;
  permissions: ResourcePermission[];
};

export function getRoles() {
  return request<AdminRole[]>('/roles');
}

export function createRole(data: RoleInput) {
  return request<AdminRole>('/roles', { method: 'POST', body: JSON.stringify(data) });
}

export function updateRole(id: string, data: Partial<RoleInput>) {
  return request<AdminRole>(`/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteRole(id: string) {
  return request<{ success: boolean }>(`/roles/${id}`, { method: 'DELETE' });
}

export type AdminAccountInput = {
  email: string;
  password: string;
  ad?: string;
  roleId: string;
};

export type AdminAccountUpdateInput = {
  ad?: string;
  roleId?: string;
  disabled?: boolean;
  password?: string;
};

export function getAdminUsers() {
  return request<AdminAccount[]>('/admin-users');
}

export function createAdminUser(data: AdminAccountInput) {
  return request<AdminAccount>('/admin-users', { method: 'POST', body: JSON.stringify(data) });
}

export function updateAdminUser(id: string, data: AdminAccountUpdateInput) {
  return request<AdminAccount>(`/admin-users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAdminUser(id: string) {
  return request<{ success: boolean }>(`/admin-users/${id}`, { method: 'DELETE' });
}
