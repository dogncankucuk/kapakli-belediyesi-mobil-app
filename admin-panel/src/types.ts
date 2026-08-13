export type Role =
  | 'superAdmin'
  | 'contentManager'
  | 'appointmentOperator'
  | 'readOnlyAuditor';

export const roleLabels: Record<Role, string> = {
  superAdmin: 'Süper Yönetici',
  contentManager: 'İçerik Yöneticisi',
  appointmentOperator: 'Randevu Operatörü',
  readOnlyAuditor: 'Salt Okunur Denetçi',
};

export interface AdminUser {
  email: string;
  role: Role;
}

export interface Announcement {
  id: string;
  baslik: string;
  icerik: string;
  resimUrl: string | null;
  yayinTarihi: string;
  kategori: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  hizmetTuru: string;
  tarih: string;
  saat: string;
  durum: string;
  userId: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TalepDurumu = 'beklemede' | 'islemde' | 'tamamlandi';

export const talepDurumLabels: Record<TalepDurumu, string> = {
  beklemede: 'Beklemede',
  islemde: 'İşlemde',
  tamamlandi: 'Tamamlandı',
};

export interface TalepRequest {
  id: string;
  kategori: string;
  aciklama: string;
  adSoyad: string;
  telefon: string;
  durum: TalepDurumu;
  ekDosyaUrl: string | null;
  userId: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Pharmacy {
  id: string;
  ad: string;
  adres: string;
  telefon: string;
  nobetTarihi: string;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeclisKarari {
  id: string;
  kararNo: string;
  kategori: string;
  tarih: string;
  baslik: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VefatIlani {
  id: string;
  adSoyad: string;
  yas: number;
  not: string;
  mekan: string;
  namazVakti: string;
  tarih: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WifiNoktasi {
  id: string;
  ad: string;
  adres: string;
  kategori: string;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Cami {
  id: string;
  ad: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type KurumTuru =
  | 'Belediye'
  | 'Kaymakamlık'
  | 'Emniyet'
  | 'Karakol'
  | 'İtfaiye'
  | 'Sağlık'
  | 'PTT'
  | 'Aşevi'
  | 'Diğer';

export const kurumTuruLabels: Record<KurumTuru, string> = {
  Belediye: 'Belediye',
  Kaymakamlık: 'Kaymakamlık',
  Emniyet: 'Emniyet',
  Karakol: 'Karakol',
  İtfaiye: 'İtfaiye',
  Sağlık: 'Sağlık',
  PTT: 'PTT',
  Aşevi: 'Aşevi',
  Diğer: 'Diğer',
};

export interface OnemliKurum {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AtikTuru =
  | 'Kağıt/Karton/Plastik/Metal'
  | 'Elektronik (AEEE)'
  | 'Tekstil'
  | 'Cam'
  | 'Pil'
  | 'Atık Getirme Merkezi'
  | 'İlaç'
  | 'Bitkisel Yağ'
  | 'Zirai İlaç Kutusu';

export const atikTuruLabels: Record<AtikTuru, string> = {
  'Kağıt/Karton/Plastik/Metal': 'Kağıt/Karton/Plastik/Metal',
  'Elektronik (AEEE)': 'Elektronik (AEEE)',
  Tekstil: 'Tekstil',
  Cam: 'Cam',
  Pil: 'Pil',
  'Atık Getirme Merkezi': 'Atık Getirme Merkezi',
  İlaç: 'İlaç',
  'Bitkisel Yağ': 'Bitkisel Yağ',
  'Zirai İlaç Kutusu': 'Zirai İlaç Kutusu',
};

export interface AtikNoktasi {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ParkTuru = 'Park' | 'Bahçe';

export const parkTuruLabels: Record<ParkTuru, string> = {
  Park: 'Park',
  Bahçe: 'Bahçe',
};

export interface Park {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type TarihiYerTuru = 'Anıt' | 'Höyük / Tümülüs' | 'Tarihi Taş' | 'Tarihi Yer';

export const tarihiYerTuruLabels: Record<TarihiYerTuru, string> = {
  'Anıt': 'Anıt',
  'Höyük / Tümülüs': 'Höyük / Tümülüs',
  'Tarihi Taş': 'Tarihi Taş',
  'Tarihi Yer': 'Tarihi Yer',
};

export interface TarihiYer {
  id: string;
  ad: string;
  tur: string;
  adres: string | null;
  lat: number;
  lng: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Baraj {
  id: string;
  ad: string;
  doluluk: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanliKesinti {
  id: string;
  tarih: string;
  ilce: string;
  aciklama: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AseviBasvuruDurumu = 'beklemede' | 'onaylandi' | 'tamamlandi';

export const aseviBasvuruDurumLabels: Record<AseviBasvuruDurumu, string> = {
  beklemede: 'Beklemede',
  onaylandi: 'Onaylandı',
  tamamlandi: 'Tamamlandı',
};

export interface AseviBasvuru {
  id: string;
  adSoyad: string;
  telefon: string;
  adres: string;
  durum: AseviBasvuruDurumu;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CitizenUser {
  id: string;
  ad: string;
  soyad: string;
  tcKimlikNo: string | null;
  telefon: string | null;
  eposta: string | null;
  googleHesabi: boolean;
  disabled: boolean;
  createdAt: string;
  updatedAt: string;
}
