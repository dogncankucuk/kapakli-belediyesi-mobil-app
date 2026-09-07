// Güncel içerik bildirim kategorileri - her biri, o içerik türü yayınlandığında
// (broadcast) veya kullanıcı bildirim tercihlerinde açık/kapalı gösterilir.
export const ICERIK_BILDIRIM_KATEGORILERI = [
  'guncel',
] as const;

// Sistem bildirim kategorileri - tekil kullanıcıya, kendi talebi/başvurusu/
// randevusuyla ilgili bir durum değişikliğinde gönderilir (broadcast değil).
export const SISTEM_BILDIRIM_KATEGORILERI = [
  'talepDurumu',
  'basvuruDurumu',
  'randevu',
] as const;

// İleride kullanılacak, henüz hiçbir modülden gönderilmeyen kategoriler.
export const PLANLANAN_BILDIRIM_KATEGORILERI = [
  'kaziCalismasi',
  'suKesintisi',
  'elektrikKesintisi',
] as const;

export const TUM_BILDIRIM_KATEGORILERI = [
  ...ICERIK_BILDIRIM_KATEGORILERI,
  ...SISTEM_BILDIRIM_KATEGORILERI,
  ...PLANLANAN_BILDIRIM_KATEGORILERI,
] as const;

export type BildirimKategorisi = (typeof TUM_BILDIRIM_KATEGORILERI)[number];
