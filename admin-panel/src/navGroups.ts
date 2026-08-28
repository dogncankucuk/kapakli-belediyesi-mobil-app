// Sidebar gruplamasi + yardimci fonksiyonlar - ayri bir dosyada, cunku hem
// App.tsx (sidebar'i cizmek icin) hem RolesPage.tsx (izin gruplarini turetmek
// icin) buna ihtiyac duyuyor. Ikisi arasinda dairesel import olusmasin diye
// (App.tsx RolesPage'i render eder, RolesPage App.tsx'ten bunlari import
// ederse modul yuklenirken "Cannot access before initialization" hatasi
// verir) tek gercek kaynak burasi.
export type Page =
  | 'haberler'
  | 'announcements'
  | 'ilanlar'
  | 'ihaleler'
  | 'makaleler'
  | 'meclisGundemleri'
  | 'baskan'
  | 'hakkimizda'
  | 'yardimMerkezi'
  | 'bizeUlasin'
  | 'faturaOdeme'
  | 'ulasimHizmetleri'
  | 'atikRehberi'
  | 'temaAyarlari'
  | 'panelTemasi'
  | 'medya'
  | 'atikNoktalari'
  | 'appointments'
  | 'requests'
  | 'pharmacies'
  | 'meclisKararlari'
  | 'vefatEdenler'
  | 'wifiNoktalari'
  | 'suHizmetleri'
  | 'asevi'
  | 'camiler'
  | 'onemliKurumlar'
  | 'parklar'
  | 'tarihiYerler'
  | 'formlar'
  | 'basvuruHizmetleri'
  | 'basvuruTurleri'
  | 'basvurular'
  | 'mapEditor'
  | 'users'
  | 'roles'
  | 'adminUsers';

export interface NavGroup {
  heading: string;
  // Sadece tek bir sayfaya sahip gruplarda kullanilir: heading'in kendisi
  // tiklanabilir bir link olur, ayrica alt sekme gostermeye gerek kalmaz
  // (bkz. "Medya" grubu).
  headingPage?: Page;
  items: { page: Page; label: string }[];
}

// Ana basliklar + alt sekmeler - butonlar sol sidebar'da bu gruplamayla
// gosterilir. Bu panelin tamami adminler icindir - hicbir grup vatandasa
// acik degildir. Bazi gruplar sadece mobil uygulamadan gelen vatandas
// verisini (randevu/talep/hesap) yonetmeye yarar, bu farkli bir sey -
// grup basliklari bu yuzden "kim kullanir" degil "admin ne yapiyor"
// mantigiyla adlandirilir (bkz. Gurkan'in duzeltmesi: panel vatandas icin
// degil, mobil uygulamayi yonetecek adminler icindir).
// "Harita Konumları" grubu, lat/lng iceren tum icerik turlerini (harita
// katmanlarini besleyen kaynaklar) ve harita editorunu bir arada toplar.
export const NAV_GROUPS: NavGroup[] = [
  {
    heading: 'Güncel',
    items: [
      { page: 'haberler', label: 'Haberler' },
      { page: 'announcements', label: 'Duyurular' },
      { page: 'ilanlar', label: 'İlanlar' },
      { page: 'ihaleler', label: 'İhaleler' },
      { page: 'makaleler', label: 'Makaleler' },
      { page: 'meclisGundemleri', label: 'Meclis Gündemleri' },
      { page: 'meclisKararlari', label: 'Meclis Kararları' },
    ],
  },
  {
    heading: 'Kurumsal',
    items: [
      { page: 'baskan', label: 'Başkanımız' },
      { page: 'hakkimizda', label: 'Hakkımızda' },
      { page: 'yardimMerkezi', label: 'Yardım Merkezi' },
      { page: 'bizeUlasin', label: 'Bize Ulaşın' },
    ],
  },
  {
    // Mobil uygulamadaki "Hizmetler" sekmesindeki servis katalogunun
    // (SERVICE_CATALOG) birebir eslesigi - hava durumu/hava kalitesi haric
    // (onlar dis API'den canli cekiliyor, admin panelde yonetilecek icerik
    // yok). Bazi ogeler baska gruplarda zaten var olan sayfalara isaret
    // eder (ayni kaynagi iki basliktan erisilebilir kilmak icin kasitli).
    heading: 'Hizmetler',
    items: [
      { page: 'faturaOdeme', label: 'Fatura Ödeme' },
      { page: 'suHizmetleri', label: 'Su Hizmetleri' },
      { page: 'formlar', label: 'Formlar ve Dilekçeler' },
      { page: 'ulasimHizmetleri', label: 'Ulaşım Hizmetleri' },
      { page: 'atikRehberi', label: 'Atık Rehberi' },
      { page: 'pharmacies', label: 'Nöbetçi Eczaneler' },
      { page: 'vefatEdenler', label: 'Vefat Edenler' },
    ],
  },
  {
    heading: 'Talepler',
    items: [{ page: 'requests', label: 'Talepler' }],
  },
  {
    heading: 'Başvurular',
    items: [
      { page: 'basvuruTurleri', label: 'Başvuru Türleri' },
      { page: 'basvurular', label: 'Başvurular' },
    ],
  },
  {
    heading: 'Harita Konumları',
    items: [
      { page: 'mapEditor', label: 'Harita Editörü' },
      { page: 'atikNoktalari', label: 'Atık Konumları' },
      { page: 'camiler', label: 'Camiler' },
      { page: 'onemliKurumlar', label: 'Önemli Kurumlar' },
      { page: 'parklar', label: 'Parklar' },
      { page: 'tarihiYerler', label: 'Tarihi Yerler' },
      { page: 'wifiNoktalari', label: 'Wi-Fi Noktaları' },
      { page: 'pharmacies', label: 'Nöbetçi Eczaneler' },
    ],
  },
  {
    heading: 'Medya',
    headingPage: 'medya',
    items: [],
  },
  {
    heading: 'Ayarlar',
    items: [
      { page: 'panelTemasi', label: 'Panel Görünümü' },
      { page: 'temaAyarlari', label: 'Mobil Görünüm Ayarları' },
      { page: 'roles', label: 'Roller' },
      { page: 'adminUsers', label: 'Yönetici Kullanıcılar' },
      { page: 'users', label: 'Mobil Uygulama Kullanıcıları' },
    ],
  },
  {
    heading: 'Kapalı Hizmetler',
    items: [{ page: 'appointments', label: 'Randevular' }],
  },
];

// Harita Editörü tek bir kaynağa değil, harita katmanlarını besleyen tüm
// kaynaklara bağlı - bunlardan en az birini yönetebilen görebilir.
export const MAP_EDITOR_RESOURCES = [
  'camiler',
  'onemliKurumlar',
  'parklar',
  'tarihiYerler',
  'wifiNoktalari',
  'pharmacies',
];

export function pageResource(page: Page): string | null {
  if (page === 'mapEditor') return null;
  // "Ulaşım Hizmetleri" nav ogesi UlasimHatlariPage'i render eder (bkz.
  // App.tsx'teki page === 'ulasimHizmetleri' blogu) - gorunurluk de o
  // sayfanin gercekte yonettigi kaynakla (ulasimHatlari) eslesmeli, aksi
  // halde bir rol 'ulasimHizmetleri' izniyle menuyu gorup hicbir seyi
  // duzenleyemez ya da tam tersi olur.
  if (page === 'ulasimHizmetleri') return 'ulasimHatlari';
  return page;
}
