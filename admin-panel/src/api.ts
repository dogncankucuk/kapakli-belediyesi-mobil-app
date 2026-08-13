import type {
  AdminUser,
  Announcement,
  Appointment,
  AtikNoktasi,
  Baraj,
  Cami,
  CitizenUser,
  AseviBasvuru,
  AseviBasvuruDurumu,
  MeclisKarari,
  OnemliKurum,
  Park,
  PlanliKesinti,
  Pharmacy,
  TalepDurumu,
  TalepRequest,
  TarihiYer,
  VefatIlani,
  WifiNoktasi,
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
