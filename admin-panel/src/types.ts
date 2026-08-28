// Roller artik veritabaninda tanimli, dinamik (bkz. RolesPage). Bir kaynak
// (resource) icin iki seviye yetki var: "list" (goruntule) ve "manage"
// (olustur+duzenle+sil hepsi birden - backend hala ayri ayri kontrol eder,
// panel sadece 2 sutuna sadelestirir).
export type PermissionLevel = 'list' | 'manage';
export type PermissionsMap = Record<string, PermissionLevel[]>;

export interface RoleRef {
  id: string;
  name: string;
  isFullAccess: boolean;
}

export interface AdminUser {
  email: string;
  role: RoleRef;
  permissions: PermissionsMap;
}

export type ResourceAction = 'list' | 'show' | 'create' | 'edit' | 'delete';

export interface ResourcePermission {
  resource: string;
  actions: ResourceAction[];
}

export interface AdminRole {
  id: string;
  name: string;
  isFullAccess: boolean;
  isProtected: boolean;
  permissions: ResourcePermission[];
  userCount: number;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAccount {
  id: string;
  email: string;
  ad: string | null;
  roleId: string;
  roleName: string;
  disabled: boolean;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// Izin matrisi (RolesPage) ve sidebar gorunurlugu (App.tsx) icin ortak
// kaynak -> etiket eslemesi. Backend'deki AdminResource union'iyla birebir
// aynı anahtarları kullanır (bkz. backend require-permission.decorator.ts).
export const RESOURCE_LABELS: Record<string, string> = {
  haberler: 'Haberler',
  announcements: 'Duyurular',
  ilanlar: 'İlanlar',
  ihaleler: 'İhaleler',
  makaleler: 'Makaleler',
  meclisGundemleri: 'Meclis Gündemleri',
  baskan: 'Başkanımız',
  hakkimizda: 'Hakkımızda',
  yardimMerkezi: 'Yardım Merkezi',
  bizeUlasin: 'Bize Ulaşın',
  faturaOdeme: 'Fatura Ödeme',
  ulasimHizmetleri: 'Ulaşım Hizmetleri',
  temaAyarlari: 'Mobil Görünüm Ayarları',
  panelTemasi: 'Panel Görünümü',
  medya: 'Medya Kütüphanesi',
  formlar: 'Formlar ve Dilekçeler',
  basvuruHizmetleri: 'Başvuru Hizmetleri',
  basvuruTurleri: 'Başvuru Türleri',
  basvurular: 'Başvurular',
  appointments: 'Randevular',
  requests: 'Talepler',
  asevi: 'Aşevi',
  camiler: 'Camiler',
  onemliKurumlar: 'Önemli Kurumlar',
  parklar: 'Parklar',
  tarihiYerler: 'Tarihi Yerler',
  wifiNoktalari: 'Wi-Fi Noktaları',
  pharmacies: 'Nöbetçi Eczaneler',
  ulasimHatlari: 'Ulaşım Hatları',
  atikRehberi: 'Atık Rehberi',
  meclisKararlari: 'Meclis Kararları',
  vefatEdenler: 'Vefat Edenler',
  atikNoktalari: 'Atık Konumları',
  suHizmetleri: 'Su Hizmetleri',
  users: 'Mobil Uygulama Kullanıcıları',
  roles: 'Roller',
  adminUsers: 'Yönetici Kullanıcılar',
};

export const RESOURCE_ORDER = Object.keys(RESOURCE_LABELS);

export interface Announcement {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
  kategori: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Haber {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ilan {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ihale {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Makale {
  id: string;
  baslik: string;
  icerik: string;
  resimUrlleri: string[];
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  yayinTarihi: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeclisGundemi {
  id: string;
  baslik: string;
  tarih: string;
  icerik: string;
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Baskan {
  ad: string;
  photoUrl: string | null;
  introText: string;
  maddeler: string[];
  kapanisText: string;
  updatedBy: string | null;
}

export interface Hakkimizda {
  baskanOzetMetni: string;
  tarihcePhotoUrl: string | null;
  tarihceParagraflari: string[];
  kurulusYili: string;
  buyuksehirYili: string;
  nufus: string;
  updatedBy: string | null;
}

export interface BizeUlasinBilgisi {
  telefon: string;
  whatsapp: string;
  eposta: string;
  adres: string;
  lat: number;
  lng: number;
  updatedBy: string | null;
}

export interface YardimMerkeziSoru {
  id: string;
  soru: string;
  cevap: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FaturaOdemeKurumu {
  id: string;
  ad: string;
  aciklama: string;
  url: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UlasimSecenegi {
  id: string;
  baslik: string;
  aciklama: string;
  url: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type KalkisYonu = 'gidis' | 'donus';

export interface KalkisSaati {
  saat: string;
  yon: KalkisYonu;
}

export interface UlasimHatti {
  id: string;
  hatAdi: string;
  hatNumarasi: string | null;
  guzergah: string;
  canli: boolean;
  hatKodu: string | null;
  fiyatTam: string | null;
  fiyatIndirimli: string | null;
  kalkisSaatleri: KalkisSaati[];
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MedyaDosyasi {
  id: string;
  dosyaAdi: string;
  orijinalAd: string;
  mimeType: string;
  boyut: number;
  url: string;
  updatedBy: string | null;
  createdAt: string;
}

export interface PanelTemasi {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  fontFamily: string;
  radius: number;
  updatedBy?: string | null;
}

export interface TemaAyarlari {
  primaryColorLight: string;
  secondaryColorLight: string;
  backgroundColorLight: string;
  primaryColorDark: string;
  secondaryColorDark: string;
  backgroundColorDark: string;
  fontFamily: string;
  updatedBy: string | null;
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

// backend/src/modules/requests/requests.service.ts'teki TALEP_KATEGORI_KODLARI
// ile birebir ayni - talep no'nun basindaki kod buradan gelir.
export const talepKategoriLabels: Record<string, string> = {
  cevre: 'Çevre',
  hava: 'Hava',
  gurultu: 'Gürültü',
  atik: 'Atık',
  altyapi: 'Altyapı',
  diger: 'Diğer',
  'ariza-bakim': 'Arıza/Bakım (eski)',
  sikayet: 'Şikayet (eski)',
  'gorus-oneri': 'Görüş/Öneri (eski)',
};

export interface TalepRequest {
  id: string;
  talepNo: string;
  kategori: string;
  aciklama: string;
  adSoyad: string;
  telefon: string;
  durum: TalepDurumu;
  ekDosyaUrl: string | null;
  lat: number | null;
  lng: number | null;
  adres: string | null;
  fotograflar: string[];
  yogunluk: number | null;
  adminNotu: string | null;
  kullaniciNotu: string | null;
  userId: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TalepFiltreleri {
  page: number;
  pageSize: number;
  kategori?: string;
  durum?: string;
  adSoyad?: string;
  telefon?: string;
  talepNo?: string;
  baslangic?: string;
  bitis?: string;
}

export interface PagedTalepRequests {
  items: TalepRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Pharmacy {
  id: string;
  ad: string;
  adres: string;
  adresTarifi: string | null;
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
  dosyaUrlleri: string[];
  youtubeUrl: string | null;
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

export interface AtikRehberiIcerik {
  tur: string;
  aciklama: string;
  updatedBy: string | null;
}

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

export interface SuHizmetleriAyarlari {
  kesintilerKaynakUrl: string;
  kesintilerGoruntulemeUrl: string;
  updatedBy: string | null;
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

export type FormBelgesiTuru = 'belge' | 'form';

export const formBelgesiTuruLabels: Record<FormBelgesiTuru, string> = {
  belge: 'Belge (dosya)',
  form: 'Online Form',
};

export interface FormBelgesi {
  id: string;
  baslik: string;
  url: string;
  tur: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BasvuruTuru = 'telefon' | 'link';

export const basvuruTuruLabels: Record<BasvuruTuru, string> = {
  telefon: 'Telefon',
  link: 'Link',
};

export interface BasvuruHizmeti {
  id: string;
  baslik: string;
  ozet: string;
  hizmetler: string[];
  kosullar: string[];
  calismaSaatleri: string | null;
  sorumluBirim: string | null;
  basvuruTuru: string;
  basvuruDegeri: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EkBilgiAlani {
  etiket: string;
  zorunlu: boolean;
}

export interface GerekliBelge {
  etiket: string;
  aciklama: string | null;
  zorunlu: boolean;
}

export interface AdminBasvuruTuru {
  id: string;
  baslik: string;
  aciklama: string | null;
  gorselUrl: string | null;
  aktif: boolean;
  ekBilgiAlanlari: EkBilgiAlani[];
  gerekliBelgeler: GerekliBelge[];
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EkBilgiDegeri {
  etiket: string;
  deger: string;
}

export interface BasvuruBelgesi {
  etiket: string;
  url: string;
  mimeType: string;
}

export type BasvuruDurumu = 'beklemede' | 'onaylandi' | 'reddedildi';

export const basvuruDurumLabels: Record<BasvuruDurumu, string> = {
  beklemede: 'Beklemede',
  onaylandi: 'Onaylandı',
  reddedildi: 'Reddedildi',
};

export interface AdminBasvuru {
  id: string;
  basvuruTuruId: string;
  basvuruTuruAdi: string;
  kimlikNo: string;
  adSoyad: string;
  dogumTarihi: string;
  adres: string;
  ekBilgiler: EkBilgiDegeri[];
  belgeler: BasvuruBelgesi[];
  durum: BasvuruDurumu;
  redSebebi: string | null;
  adminNotu: string | null;
  kullaniciNotu: string | null;
  userId: string | null;
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
