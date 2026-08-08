export type Announcement = {
  id: string;
  baslik: string;
  icerik: string;
  resimUrl: string | null;
  yayinTarihi: string;
  kategori: string;
};

export type AppointmentDurum = "beklemede";

export type Appointment = {
  id: string;
  hizmetTuru: string;
  tarih: string;
  saat: string;
  durum: AppointmentDurum;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAppointmentBody = {
  hizmetTuru: string;
  tarih: string;
  saat: string;
  userId?: string | null;
};

export type TalepKategorisi =
  "ariza-bakim" | "sikayet" | "gorus-oneri" | "diger";

export type TalepDurumu = "beklemede" | "islemde" | "tamamlandi";

export type TalepRequest = {
  id: string;
  kategori: TalepKategorisi;
  aciklama: string;
  adSoyad: string;
  telefon: string;
  durum: TalepDurumu;
  ekDosyaUrl: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRequestBody = {
  kategori: TalepKategorisi;
  aciklama: string;
  adSoyad: string;
  telefon: string;
  ekDosyaUrl?: string;
  userId?: string | null;
};

export type Pharmacy = {
  id: string;
  ad: string;
  adres: string;
  telefon: string;
  nobetTarihi: string;
  lat: number;
  lng: number;
};

export type MeclisKarari = {
  id: string;
  kararNo: string;
  kategori: string;
  tarih: string;
  baslik: string;
};

export type VefatIlani = {
  id: string;
  adSoyad: string;
  yas: number;
  not: string;
  mekan: string;
  namazVakti: string;
  tarih: string;
};

export type WifiKategorisi = "parklar" | "meydanlar";

export type WifiNoktasi = {
  id: string;
  ad: string;
  adres: string;
  kategori: WifiKategorisi;
  lat: number;
  lng: number;
};

export type Cami = {
  id: string;
  ad: string;
  adres: string | null;
  lat: number;
  lng: number;
};

export type KurumTuru =
  | "Belediye"
  | "Kaymakamlık"
  | "Emniyet"
  | "Karakol"
  | "İtfaiye"
  | "Sağlık"
  | "PTT"
  | "Diğer";

export type OnemliKurum = {
  id: string;
  ad: string;
  tur: KurumTuru;
  adres: string | null;
  lat: number;
  lng: number;
};

export type ParkTuru = "Park" | "Bahçe";

export type Park = {
  id: string;
  ad: string;
  tur: ParkTuru;
  adres: string | null;
  lat: number;
  lng: number;
};

export type TarihiYerTuru =
  "Anıt" | "Höyük / Tümülüs" | "Tarihi Taş" | "Tarihi Yer";

export type TarihiYer = {
  id: string;
  ad: string;
  tur: TarihiYerTuru;
  adres: string | null;
  lat: number;
  lng: number;
};

export type SehirKamerasi = {
  id: string;
  ad: string;
  online: boolean;
};

export type UlasimHatti = {
  id: string;
  hatAdi: string;
  guzergah: string;
  durum: string;
  canli: boolean;
};

export type Baraj = {
  id: string;
  ad: string;
  doluluk: number;
};

export type PlanliKesinti = {
  id: string;
  tarih: string;
  ilce: string;
  aciklama: string;
};

export type MenuKalemi = {
  ad: string;
  aciklama: string;
};

export type GununMenusu = {
  id: string;
  tarih: string;
  kalemler: MenuKalemi[];
  fiyat: number;
};

export type HavaKalitesiDurum = {
  key: number;
  ad: string;
  renk: string;
  aciklama: string;
};

export type HavaKalitesi = {
  istasyonAdi: string;
  olcumZamani: string;
  aqi: number;
  durum: HavaKalitesiDurum;
  baskinKirletici: string;
  kirleticiler: {
    pm25: number | null;
    pm10: number | null;
    no2: number | null;
    so2: number | null;
    co: number | null;
    o3: number | null;
  };
};

export type GunlukTahmin = {
  tarih: string;
  enDusuk: number;
  enYuksek: number;
  durumKodu: string;
  durumAdi: string;
};

export type HavaDurumu = {
  sicaklik: number;
  hissedilenSicaklik: number;
  nem: number;
  ruzgarHiz: number;
  durumKodu: string;
  durumAdi: string;
  olcumZamani: string;
  gunlukTahmin: GunlukTahmin[];
};
