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

export type KurumTuru = 'Belediye' | 'Kaymakamlık' | 'Emniyet' | 'PTT' | 'Diğer';

export const kurumTuruLabels: Record<KurumTuru, string> = {
  Belediye: 'Belediye',
  Kaymakamlık: 'Kaymakamlık',
  Emniyet: 'Emniyet',
  PTT: 'PTT',
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

export interface SehirKamerasi {
  id: string;
  ad: string;
  online: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UlasimHatti {
  id: string;
  hatAdi: string;
  guzergah: string;
  durum: string;
  canli: boolean;
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

export interface MenuKalemi {
  ad: string;
  aciklama: string;
}

export interface GununMenusu {
  id: string;
  tarih: string;
  kalemler: MenuKalemi[];
  fiyat: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
